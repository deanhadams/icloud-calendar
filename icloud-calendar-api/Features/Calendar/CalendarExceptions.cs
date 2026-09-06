namespace icloud_calendar_api.Features.Calendar;

public class EndUserNotFoundException : Exception
{
    public EndUserNotFoundException(Guid endUserIdentifier)
        : base($"End user '{endUserIdentifier}' was not found.")
    {
    }
}

public class EndUserCredentialsMissingException : Exception
{
    public EndUserCredentialsMissingException(Guid endUserIdentifier)
        : base($"End user '{endUserIdentifier}' has no iCloud credentials configured.")
    {
    }
}

/// <summary>
/// Thrown when iCloud returns 401 for a CalDAV request. Distinct from a generic CalDAV
/// failure so callers (controllers) can react specifically — e.g. return 409 Conflict
/// telling the client the end user needs to reconnect their iCloud account. The end
/// user's Status is set to "needs_reconnect" before this is thrown.
/// </summary>
public class ICloudUnauthorizedException : Exception
{
    public Guid EndUserIdentifier { get; }

    public ICloudUnauthorizedException(Guid endUserIdentifier)
        : base($"iCloud rejected the stored credentials for end user '{endUserIdentifier}'. The end user needs to reconnect.")
    {
        EndUserIdentifier = endUserIdentifier;
    }
}
