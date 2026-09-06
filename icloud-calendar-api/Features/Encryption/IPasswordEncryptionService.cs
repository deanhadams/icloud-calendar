namespace icloud_calendar_api.Features.Encryption;

public interface IPasswordEncryptionService
{
    (string Ciphertext, string Iv, string AuthTag) Encrypt(string plaintext);

    string Decrypt(string ciphertext, string iv, string authTag);
}
