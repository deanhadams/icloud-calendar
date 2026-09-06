using System.Security.Cryptography;
using System.Text;

namespace icloud_calendar_api.Features.Encryption;

/// <summary>
/// Encrypts/decrypts end-user credentials with AES-256-GCM.
///
/// Reads a base64-encoded 32-byte key from configuration key "Encryption:MasterKey"
/// (set as a Railway environment variable in deployed environments; never hardcode it).
/// Generate a valid key locally with:
///     openssl rand -base64 32
/// and set it as the ASPNETCORE_ environment's Encryption:MasterKey (or add it to
/// appsettings.Development.json, which is gitignored, for local development).
/// </summary>
public class AesGcmPasswordEncryptionService : IPasswordEncryptionService
{
    private const int NonceSizeBytes = 12;
    private const int TagSizeBytes = 16;

    private readonly byte[] _masterKey;

    public AesGcmPasswordEncryptionService(IConfiguration configuration)
    {
        var base64Key = configuration["Encryption:MasterKey"];
        if (string.IsNullOrWhiteSpace(base64Key))
        {
            throw new InvalidOperationException(
                "Encryption:MasterKey is not configured. Generate one with `openssl rand -base64 32` " +
                "and set it as an environment variable (e.g. on Railway) or in appsettings.Development.json for local development.");
        }

        _masterKey = Convert.FromBase64String(base64Key);
        if (_masterKey.Length != 32)
        {
            throw new InvalidOperationException(
                "Encryption:MasterKey must decode to exactly 32 bytes (AES-256). Generate one with `openssl rand -base64 32`.");
        }
    }

    public (string Ciphertext, string Iv, string AuthTag) Encrypt(string plaintext)
    {
        var nonce = RandomNumberGenerator.GetBytes(NonceSizeBytes);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertextBytes = new byte[plaintextBytes.Length];
        var tag = new byte[TagSizeBytes];

        using var aesGcm = new AesGcm(_masterKey, TagSizeBytes);
        aesGcm.Encrypt(nonce, plaintextBytes, ciphertextBytes, tag);

        return (Convert.ToBase64String(ciphertextBytes), Convert.ToBase64String(nonce), Convert.ToBase64String(tag));
    }

    public string Decrypt(string ciphertext, string iv, string authTag)
    {
        var ciphertextBytes = Convert.FromBase64String(ciphertext);
        var nonce = Convert.FromBase64String(iv);
        var tag = Convert.FromBase64String(authTag);
        var plaintextBytes = new byte[ciphertextBytes.Length];

        using var aesGcm = new AesGcm(_masterKey, TagSizeBytes);
        aesGcm.Decrypt(nonce, ciphertextBytes, tag, plaintextBytes);

        return Encoding.UTF8.GetString(plaintextBytes);
    }
}
