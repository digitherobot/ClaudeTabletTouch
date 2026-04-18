import os
import asyncio
import logging
import discord

logger = logging.getLogger("tablet-touch.discord")
EMBED_COLOR = 0x5865F2

class DiscordSender:
    def __init__(self):
        self.token = os.environ.get("DISCORD_BOT_TOKEN", "") or os.environ.get("CLAUDE_BOT_TOKEN", "")
        self.channel_id = int(os.environ.get("DISCORD_CHANNEL_ID", "0"))
        self.claude_id = os.environ.get("CLAUDE_USER_ID", "")
        logger.info(f"CLAUDE_USER_ID: '{self.claude_id}'")

        intents = discord.Intents.default()
        self.client = discord.Client(intents=intents)
        self._ready = asyncio.Event()
        self._channel = None

        @self.client.event
        async def on_ready():
            logger.info(f"Discord bot connected as {self.client.user}")
            self._channel = self.client.get_channel(self.channel_id)
            if self._channel is None:
                try:
                    self._channel = await self.client.fetch_channel(self.channel_id)
                except Exception as e:
                    logger.error(f"Could not find channel {self.channel_id}: {e}")
            logger.info(f"Found channel: {self._channel}")
            self._ready.set()

    async def connect(self):
        if not self.token:
            raise RuntimeError("DISCORD_BOT_TOKEN is not set")
        if self.channel_id == 0:
            raise RuntimeError("DISCORD_CHANNEL_ID is not set")
        asyncio.create_task(self.client.start(self.token))
        try:
            await asyncio.wait_for(self._ready.wait(), timeout=30)
        except asyncio.TimeoutError:
            raise RuntimeError("Discord client timed out")
        if self._channel is None:
            raise RuntimeError(f"Could not resolve Discord channel {self.channel_id}")
        logger.info(f"Discord sender ready, channel: {self._channel}")

    async def send_touch(self, touch_result: dict) -> bool:
        """Called by server.py with structured touch result dict."""
        if not self._channel:
            logger.error("No Discord channel available")
            return False
        try:
            mention = f"<@{self.claude_id}>" if self.claude_id else None
            title = touch_result.get('title', 'Touch Received')
            description = touch_result.get('description', '')

            embed = discord.Embed(title=title, description=description[:4096], color=EMBED_COLOR)
            await self._channel.send(content=mention, embed=embed)
            logger.info("Touch embed sent to Discord")
            return True
        except Exception as e:
            logger.error(f"Failed to send: {e}")
            return False

    async def send(self, description: str) -> bool:
        """Legacy helper for plain string."""
        return await self.send_touch({
            'title': 'Touch Received',
            'description': description,
        })

    async def close(self):
        await self.client.close()
