from typing import cast

from danswer.configs.constants import KV_USER_STORE_KEY
from danswer.key_value_store.factory import get_kv_store
from danswer.key_value_store.interface import JSON_ro
from danswer.key_value_store.interface import KvKeyNotFoundError

from danswer.auth.users import send_invite_welcome_email
import time

def get_invited_users() -> list[str]:
    try:
        store = get_kv_store()

        return cast(list, store.load(KV_USER_STORE_KEY))
    except KvKeyNotFoundError:
        return list()


def write_invited_users(emails: list[str]) -> int:
    store = get_kv_store()
    store.store(KV_USER_STORE_KEY, cast(JSON_ro, emails))

    # AWS SES has default rate limit of 1 email/second
    RATE_LIMIT = 1.0

    for email in emails:
        send_invite_welcome_email(email)
        time.sleep(RATE_LIMIT)

    return len(emails)
