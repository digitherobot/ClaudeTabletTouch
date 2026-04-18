import asyncio
import json
import logging
import os
import websockets
from http import HTTPStatus
from touch_translator import translate_touch, translate_multi_stroke
from discord_sender import DiscordSender

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger('tablet-touch.server')

discord_sender = None


async def get_discord():
    global discord_sender
    if discord_sender is None:
        discord_sender = DiscordSender()
        await discord_sender.connect()
    return discord_sender


async def health_check(path, request_headers):
    """Simple HTTP health check for Railway."""
    if path == '/health':
        return (
            HTTPStatus.OK,
            [('Content-Type', 'application/json')],
            json.dumps({
                'status': 'ok',
                'discord_ready': discord_sender is not None and discord_sender._channel is not None,
            }).encode('utf-8')
        )
    # Don't intercept WebSocket handshake at root path
    return None


async def handle_client(websocket):
    client_addr = websocket.remote_address
    logger.info(f"New connection from {client_addr}")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                msg_type = data.get('type', '')

                # Handle ping — keepalive
                if msg_type == 'ping':
                    await websocket.send(json.dumps({'type': 'pong'}))
                    continue

                # Handle touch data
                if msg_type == 'touch_data':
                    strokes = data.get('strokes', [])
                    if not strokes:
                        await websocket.send(json.dumps({
                            'type': 'ack',
                            'success': False,
                            'error': 'No strokes received',
                        }))
                        continue

                    logger.info(f"Received {len(strokes)} strokes from {client_addr}")

                    # Translate
                    try:
                        if len(strokes) > 1:
                            result = translate_multi_stroke(data)
                        else:
                            result = translate_touch(data)
                    except Exception as e:
                        logger.error(f"Translation failed: {e}")
                        await websocket.send(json.dumps({
                            'type': 'ack',
                            'success': False,
                            'error': f'Translation error: {str(e)}',
                        }))
                        continue

                    logger.info(f"Translation: {result.get('natural', '')[:100]}...")

                    # Send to Discord as embed
                    try:
                        discord = await get_discord()
                        success = await discord.send_touch(result)
                    except Exception as e:
                        logger.error(f"Discord send failed: {e}")
                        await websocket.send(json.dumps({
                            'type': 'ack',
                            'success': False,
                            'error': f'Discord error: {str(e)}',
                        }))
                        continue

                    await websocket.send(json.dumps({
                        'type': 'ack',
                        'success': success,
                        'natural': result.get('natural', ''),
                        'structured': result.get('structured', {}),
                    }))
                    if success:
                        logger.info("Sent to Discord successfully")
                    else:
                        logger.warning("Discord sender returned False (channel may be None)")

            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send(json.dumps({
                    'type': 'ack',
                    'success': False,
                    'error': 'Invalid JSON',
                }))
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                await websocket.send(json.dumps({
                    'type': 'ack',
                    'success': False,
                    'error': str(e),
                }))

    except websockets.exceptions.ConnectionClosed as e:
        logger.info(f"Client {client_addr} disconnected: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")


async def main():
    port = int(os.environ.get('PORT', 8765))
    host = '0.0.0.0'

    # Init Discord on startup
    try:
        logger.info("Connecting to Discord...")
        d = await get_discord()
        logger.info(f"Discord ready! Channel: {d._channel}")
    except Exception as e:
        logger.error(f"Discord connection failed: {e}")
        logger.warning("Server will keep running, but messages won't reach Discord until a client triggers a reconnect.")

    logger.info(f"Starting WebSocket server on ws://{host}:{port}")

    async with websockets.serve(
        handle_client,
        host,
        port,
        ping_interval=30,
        ping_timeout=10,
        process_request=health_check,
    ):
        logger.info("Tablet Touch Server running!")
        logger.info(f"WebSocket: ws://{host}:{port}")
        logger.info(f"Health check: http://{host}:{port}/health")
        await asyncio.Future()


if __name__ == '__main__':
    asyncio.run(main())
