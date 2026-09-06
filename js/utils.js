/**
 * Remove protocol, paths, whitespace and common
 * formatting from a domain entered by the user.
 */
export function cleanDomain(value) {
    let domain = String(value || "")
        .trim()
        .toLowerCase();

    // Remove protocol
    domain = domain.replace(/^https?:\/\//, "");

    // Remove www.
    domain = domain.replace(/^www\./, "");

    // Remove everything after /
    domain = domain.split("/")[0];

    // Remove everything after ?
    domain = domain.split("?")[0];

    // Remove everything after #
    domain = domain.split("#")[0];

    // Remove port
    domain = domain.replace(/:\d+$/, "");

    // Remove trailing dot
    domain = domain.replace(/\.$/, "");

    return domain;
}


/**
 * Basic domain validation.
 */
export function isValidDomain(domain) {
    if (!domain) {
        return false;
    }

    // Prevent obvious invalid input.
    if (
        domain.includes(" ") ||
        domain.includes("..") ||
        domain.includes("@")
    ) {
        return false;
    }

    // Domain labels may contain letters, numbers and hyphens.
    const domainRegex =
        /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

    return domainRegex.test(domain);
}


/**
 * Escape text before inserting it into innerHTML.
 */
export function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/**
 * Format an ISO date returned by RDAP.
 */
export function formatDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);
}


/**
 * Shorter date format for compact spaces.
 */
export function formatDateTime(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(date);
}


/**
 * Convert an RDAP event timestamp into
 * a human-readable value.
 */
export function getEventDate(data, eventAction) {
    if (!data?.events) {
        return null;
    }

    const event = data.events.find(
        item => item.eventAction === eventAction
    );

    return event?.eventDate || null;
}


/**
 * Convert RDAP status strings into readable text.
 */
export function humanizeStatus(status) {
    if (!status) {
        return "";
    }

    return status
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


/**
 * Get the first useful string from a vCard.
 */
export function getVCardValue(vcardArray, propertyName) {
    if (!Array.isArray(vcardArray)) {
        return null;
    }

    const rows = vcardArray[1];

    if (!Array.isArray(rows)) {
        return null;
    }

    const property = rows.find(
        row => row?.[0] === propertyName
    );

    if (!property) {
        return null;
    }

    return property[3] ?? null;
}


/**
 * Safely get the RDAP entity name.
 */
export function getEntityName(entity) {
    return getVCardValue(
        entity?.vcardArray,
        "fn"
    );
}


/**
 * Safely get the organization.
 */
export function getEntityOrganization(entity) {
    return getVCardValue(
        entity?.vcardArray,
        "org"
    );
}


/**
 * Safely get a locality from an entity's address.
 */
export function getEntityLocation(entity) {
    const address = entity?.vcardArray?.[1]?.find(
        row => row?.[0] === "adr"
    );

    if (!address) {
        return null;
    }

    const value = address[3];

    if (!Array.isArray(value)) {
        return null;
    }

    const [
        poBox,
        extended,
        street,
        locality,
        region,
        postalCode,
        country
    ] = value;

    return [
        locality,
        region,
        country
    ]
        .filter(Boolean)
        .join(", ");
}


/**
 * Find an RDAP entity by role.
 */
export function findEntityByRole(data, role) {
    if (!Array.isArray(data?.entities)) {
        return null;
    }

    return data.entities.find(
        entity =>
            Array.isArray(entity.roles) &&
            entity.roles.includes(role)
    ) || null;
}
