namespace VideoBackend.BusinessLayer.Interfaces;

public interface IEmailSender
{
    Task SendVerificationEmailAsync(string toEmail, string token);
    Task SendVerificationCodeAsync(string toEmail, string code);
    Task SendPasswordResetEmailAsync(string toEmail, string token);
}
