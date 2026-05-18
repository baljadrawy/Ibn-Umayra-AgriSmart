FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# تشغيل بمستخدم غير-root (uid 1000 — يطابق ملكية volume الـ data)
RUN useradd -u 1000 -m appuser
USER appuser

CMD ["python", "bot.py"]
