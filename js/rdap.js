import {
    getEventDate,
    findEntityByRole,
    getEntityName,
    getEntityOrganization,
    getEntityLocation
} from "./utils.js";


const RDAP_ENDPOINT =
    "https://rdap.org/domain/";


const REQUEST_TIMEOUT = 12000;


/**
 * Fetch RDAP information for a domain.
 */
export async function lookupDomain(domain) {

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT
    );


    try {

        const url =
            RDAP_ENDPOINT +
            encodeURIComponent(domain);


        const response = await fetch(
            url,
            {
                method: "GET",

                mode: "cors",

                cache: "no-store",

                headers: {
                    "Accept":
                        "application/rdap+json, application/json"
                },

                signal: controller.signal
            }
        );


        if (!response.ok) {

            if (response.status === 404) {
                throw new Error(
                    "That domain could not be found in RDAP."
                );
            }


            if (response.status === 429) {
                throw new Error(
                    "The RDAP service is temporarily rate-limiting requests. Please try again in a moment."
                );
            }


            if (response.status >= 500) {
                throw new Error(
                    "The RDAP service is temporarily unavailable."
                );
            }


            throw new Error(
                `RDAP returned HTTP ${response.status}.`
            );
        }


        const data = await response.json();


        if (!data || typeof data !== "object") {
            throw new Error(
                "The RDAP server returned an invalid response."
            );
        }


        return parseRDAPResponse(data);

    } catch (error) {

        if (error.name === "AbortError") {
            throw new Error(
                "The RDAP request timed out. The registration server may be slow or unavailable."
            );
        }


        if (
            error instanceof TypeError &&
            error.message
                .toLowerCase()
                .includes("fetch")
        ) {
            throw new Error(
                "Your browser could not access the RDAP server. This may be caused by browser/network security or CORS."
            );
        }


        throw error;

    } finally {

        clearTimeout(timeout);

    }
}


/**
 * Convert raw RDAP JSON into the small set
 * of information our interface needs.
 */
function parseRDAPResponse(data) {

    const registrant =
        findEntityByRole(
            data,
            "registrant"
        );


    const registrar =
        findEntityByRole(
            data,
            "registrar"
        );


    const registrationDate =
        getEventDate(
            data,
            "registration"
        );


    const expirationDate =
        getEventDate(
            data,
            "expiration"
        );


    const lastChanged =
        getEventDate(
            data,
            "last changed"
        );


    return {

        domain:
            data.ldhName ||
            data.unicodeName ||
            "Unknown domain",


        handle:
            data.handle ||
            null,


        registrant: {

            name:
                getEntityName(registrant),

            organization:
                getEntityOrganization(registrant),

            location:
                getEntityLocation(registrant)

        },


        registrar: {

            name:
                getEntityName(registrar),

            handle:
                registrar?.handle ||
                null

        },


        registrationDate,

        expirationDate,

        lastChanged,

        statuses:
            Array.isArray(data.status)
                ? data.status
                : [],


        nameservers:
            Array.isArray(data.nameservers)
                ? data.nameservers
                : [],


        raw: data

    };
}
