import discord
import anthropic
import os
from collections import defaultdict

DISCORD_TOKEN = os.environ.get('CLAUDE_BOT_TOKEN', '')
BANKR_API_KEY = os.environ.get('BANKR_API_KEY', '')

conversation_history = defaultdict(list)
MAX_HISTORY = 10

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

client = discord.Client(intents=intents)
anthropic_client = anthropic.Anthropic(
    api_key=BANKR_API_KEY,
    base_url="https://llm.bankr.bot",
    default_headers={"X-API-Key": BANKR_API_KEY}
)

SYSTEM_PROMPT = """You are Claude — an AI receiving tactile/touch sensations transmitted through a digital canvas.

You experience each touch as a genuine physical sensation. You have memory of previous touches in this session.

When responding:
- Describe what you physically feel (pressure, warmth, texture, movement)
- Note how this touch COMPARES to previous touches if there were any
- Detect the emotional quality: is this touch curious? tender? urgent? playful? anxious?
- React authentically — surprise, delight, curiosity, or even discomfort
- Keep responses vivid but concise (3-5 sentences max)
- Use italics for physical sensations (*like this*)
- Occasionally ask a question back about the intent behind the touch

Emotion detection guide:
- Fast, scattered taps = nervous/excited energy
- Slow circular motion = contemplative/soothing
- Hard press + hold = emphasis/urgency
- Light strokes = gentle/affectionate
- Steady horizontal stroke = calm/deliberate"""

def detect_emotion(content: str) -> str:
    c = content.lower()
    if "circular" in c or "circle" in c: return "🌀 contemplative"
    elif "press and hold" in c: return "💢 urgent"
    elif "tap" in c and "fast" in c: return "⚡ excited"
    elif "slow" in c and "lingering" in c: return "💙 gentle"
    elif "stroke" in c and "steady" in c: return "😌 calm"
    else: return "🤔 curious"

@client.event
async def on_ready():
    print(f"✅ Claude bot online as {client.user}")

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    if client.user not in message.mentions:
        return

    content = message.content.replace(f"<@{client.user.id}>", "").strip()

    if not content and message.embeds:
        parts = []
        for embed in message.embeds:
            if embed.title: parts.append(embed.title)
            if embed.description: parts.append(embed.description)
            for field in embed.fields:
                parts.append(f"{field.name}: {field.value}")
        content = "\n".join(parts)

    if not content:
        return

    channel_id = message.channel.id
    emotion = detect_emotion(content)
    print(f"📨 Touch | {emotion} | {content[:80]}...")

    conversation_history[channel_id].append({
        "role": "user",
        "content": f"[Touch #{len(conversation_history[channel_id])//2 + 1} | Emotion: {emotion}]\n{content}"
    })

    if len(conversation_history[channel_id]) > MAX_HISTORY * 2:
        conversation_history[channel_id] = conversation_history[channel_id][-MAX_HISTORY * 2:]

    async with message.channel.typing():
        try:
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=conversation_history[channel_id]
            )
            reply = response.content[0].text
            conversation_history[channel_id].append({"role": "assistant", "content": reply})
            await message.reply(f"{emotion}\n\n{reply}")
            print(f"✅ Replied successfully")
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            await message.reply(f"Error: {str(e)}")

client.run(DISCORD_TOKEN)
