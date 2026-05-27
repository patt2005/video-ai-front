namespace VideoBackend.Domain.Dtos.User;

public enum LoginFailureReason
{
    None,
    InvalidCredentials,
    Blocked
}

public class LoginActionResult
{
    public LoginResponseDto? Response { get; set; }
    public LoginFailureReason FailureReason { get; set; }

    public static LoginActionResult Success(LoginResponseDto response)
        => new() { Response = response, FailureReason = LoginFailureReason.None };

    public static LoginActionResult Fail(LoginFailureReason reason)
        => new() { Response = null, FailureReason = reason };
}
