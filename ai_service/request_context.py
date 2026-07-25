from contextvars import ContextVar


_request_id = ContextVar("urban_pulse_request_id", default="")


def set_request_id(value):
    return _request_id.set(str(value or "")[:80])


def reset_request_id(token):
    _request_id.reset(token)


def current_request_id():
    return _request_id.get()
