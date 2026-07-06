"""SendGrid email service.

- Env-var config only.
- Fails gracefully when keys are missing: EmailLog is written with status='skipped' or 'failed'.
- Never crashes the calling request.
"""
from __future__ import annotations

import logging
from typing import Optional

from ..core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()


def is_configured() -> bool:
    return bool(_settings.sendgrid_api_key and _settings.sendgrid_from_email)


def send_email(
    *,
    to_email: str,
    subject: str,
    body_text: str,
    body_html: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> tuple[bool, str | None, str | None]:
    """Return (ok, message_id, error_message).

    If not configured, returns (False, None, 'sendgrid_not_configured').
    """
    if not is_configured():
        return False, None, "sendgrid_not_configured"
    try:
        from sendgrid import SendGridAPIClient  # type: ignore
        from sendgrid.helpers.mail import Mail, ReplyTo  # type: ignore

        message = Mail(
            from_email=(_settings.sendgrid_from_email, _settings.sendgrid_from_name),
            to_emails=to_email,
            subject=subject,
            plain_text_content=body_text,
            html_content=body_html or f"<pre>{body_text}</pre>",
        )
        if reply_to:
            message.reply_to = ReplyTo(reply_to)
        sg = SendGridAPIClient(_settings.sendgrid_api_key)
        response = sg.send(message)
        msg_id = response.headers.get("X-Message-Id") if hasattr(response, "headers") else None
        if 200 <= response.status_code < 300:
            return True, msg_id, None
        return False, msg_id, f"sendgrid_http_{response.status_code}"
    except Exception as e:  # noqa: BLE001
        logger.exception("SendGrid send failed")
        return False, None, f"exception:{type(e).__name__}:{e}"
