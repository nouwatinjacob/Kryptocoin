from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class UsernameAuthBackend(ModelBackend):
    """
    Custom authentication backend that allows login with username
    even when email is the USERNAME_FIELD
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to find user by username
            user = User.objects.get(username=username)
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except User.DoesNotExist:
            return None
