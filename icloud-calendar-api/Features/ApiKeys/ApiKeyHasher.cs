using System.Security.Cryptography;
using System.Text;

namespace icloud_calendar_api.Features.ApiKeys;

public static class ApiKeyHasher
{
    public static string Hash(string rawKey) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawKey)));
}
