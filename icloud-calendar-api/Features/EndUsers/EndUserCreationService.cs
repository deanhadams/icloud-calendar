using icloud_calendar_api.Data;
using icloud_calendar_api.Features.Encryption;

namespace icloud_calendar_api.Features.EndUsers;

public class EndUserCreationService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordEncryptionService _encryptionService;

    public EndUserCreationService(AppDbContext dbContext, IPasswordEncryptionService encryptionService)
    {
        _dbContext = dbContext;
        _encryptionService = encryptionService;
    }

    public async Task<EndUser> CreateAsync(int clientId, string icloudEmail, string appSpecificPassword, string calendarName)
    {
        var (ciphertext, iv, authTag) = _encryptionService.Encrypt(appSpecificPassword);

        var endUser = new EndUser
        {
            ClientId = clientId,
            IcloudEmail = icloudEmail,
            EncryptedPassword = ciphertext,
            EncryptionIv = iv,
            EncryptionAuthTag = authTag,
            CalendarName = calendarName
        };

        _dbContext.EndUsers.Add(endUser);
        await _dbContext.SaveChangesAsync();

        return endUser;
    }
}
