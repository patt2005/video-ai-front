namespace VideoBackend.BusinessLayer.Interfaces;

public interface IEmailSender
{
    Task SendVerificationEmailAsync(string toEmail, string token);
}
