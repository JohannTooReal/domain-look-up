import {
    cleanDomain,
    isValidDomain,
    escapeHTML,
    formatDate,
    formatDateTime,
    humanizeStatus
} from "./utils.js";

import {
    lookupDomain
} from "./rdap.js";


// --------------------------------------------------
// DOM
// --------------------------------------------------

const form =
    document.getElementById("lookup-form");

const input =
    document.getElementById("domain-input");

const lookupButton =
    document.getElementById("lookup-button");

const clearButton =
    document.getElementById("clear-button");

const formMessage =
    document.getElementById("form-message");

const loadingState =
    document.getElementById("loading-state");

const loadingDomain =
    document.getElementById("loading-domain");

const errorState =
    document.getElementById("error-state");

const errorMessage =
    document.getElementById("error-message");

const results =
    document.getElementById("results");


// Result fields

const resultDomain =
    document.getElementById("result-domain");

const resultStatus =
    document.getElementById("result-status");

const registrantName =
    document.getElementById("registrant-name");

const registrantOrg =
    document.getElementById("registrant-org");

const registrantLocation =
    document.getElementById("registrant-location");

const registrarName =
    document.getElementById("registrar-name");

const registrarId =
    document.getElementById("registrar-id");

const registrationDate =
    document.getElementById("registration-date");

const expirationDate =
    document.getElementById("expiration-date");

const updatedDate =
    document.getElementById("updated-date");

const statusList =
    document.getElementById("status-list");

const lookupTime =
    document.getElementById("lookup-time");


// --------------------------------------------------
// STATE
// --------------------------------------------------

let isLoading = false;


// --------------------------------------------------
// INPUT
// --------------------------------------------------

input.addEventListener(
    "input",
    () => {

        const hasText =
            input.value.trim().length > 0;

        clearButton.classList.toggle(
            "hidden",
            !hasText
        );

        clearFormMessage();

    }
);


clearButton.addEventListener(
    "click",
    () => {

        input.value = "";

        clearButton.classList.add(
            "hidden"
        );

        input.focus();

        clearFormMessage();

    }
);


// --------------------------------------------------
// FORM
// --------------------------------------------------

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (isLoading) {
            return;
        }

        await performLookup();

    }
);


// --------------------------------------------------
// MAIN LOOKUP
// --------------------------------------------------

async function performLookup() {

    const domain =
        cleanDomain(input.value);


    // Validation

    if (!domain) {

        showFormMessage(
            "Enter a domain name first."
        );

        input.focus();

        return;
    }


    if (!isValidDomain(domain)) {

        showFormMessage(
            "Enter a valid domain, such as example.com."
        );

        input.focus();

        return;
    }


    // Start

    setLoading(true);

    hideError();

    hideResults();


    const startTime =
        performance.now();


    try {

        const data =
            await lookupDomain(domain);


        renderResults(data);


        const elapsed =
            Math.round(
                performance.now() - startTime
            );


        lookupTime.textContent =
            `Lookup completed in ${elapsed} ms`;


    } catch (error) {

        showError(
            error?.message ||
            "The lookup failed."
        );

    } finally {

        setLoading(false);

    }
}


// --------------------------------------------------
// LOADING
// --------------------------------------------------

function setLoading(value) {

    isLoading = value;

    lookupButton.disabled =
        value;

    lookupButton.classList.toggle(
        "loading",
        value
    );


    if (value) {

        const domain =
            cleanDomain(input.value);

        loadingDomain.textContent =
            domain
                ? domain
                : "";

        loadingState.classList.remove(
            "hidden"
        );

    } else {

        loadingState.classList.add(
            "hidden"
        );

    }
}


// --------------------------------------------------
// RESULTS
// --------------------------------------------------

function renderResults(data) {

    results.classList.remove(
        "hidden"
    );


    // Domain

    resultDomain.textContent =
        data.domain;


    // Status

    const firstStatus =
        data.statuses?.[0];


    if (firstStatus) {

        resultStatus.textContent =
            humanizeStatus(
                firstStatus
            );

    } else {

        resultStatus.textContent =
            "Active";

    }


    // Registrant

    const ownerName =
        data.registrant?.name;


    registrantName.textContent =
        ownerName ||
        "Not publicly available";


    registrantOrg.textContent =
        data.registrant?.organization ||
        "";


    registrantLocation.textContent =
        data.registrant?.location ||
        "";


    // Registrar

    registrarName.textContent =
        data.registrar?.name ||
        "Not available";


    registrarId.textContent =
        data.registrar?.handle
            ? `ID: ${data.registrar.handle}`
            : "";


    // Dates

    registrationDate.textContent =
        formatDate(
            data.registrationDate
        );


    expirationDate.textContent =
        formatDate(
            data.expirationDate
        );


    updatedDate.textContent =
        formatDateTime(
            data.lastChanged
        );


    // Statuses

    renderStatuses(
        data.statuses
    );


    // Scroll

    requestAnimationFrame(
        () => {

            results.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );
}


// --------------------------------------------------
// STATUS PILLS
// --------------------------------------------------

function renderStatuses(statuses) {

    statusList.innerHTML = "";


    if (!statuses?.length) {

        const pill =
            document.createElement("span");

        pill.className =
            "status-pill";

        pill.textContent =
            "No status information";

        statusList.appendChild(
            pill
        );

        return;
    }


    statuses.forEach(
        status => {

            const pill =
                document.createElement("span");

            pill.className =
                "status-pill";

            pill.textContent =
                humanizeStatus(status);

            statusList.appendChild(
                pill
            );

        }
    );
}


// --------------------------------------------------
// ERRORS
// --------------------------------------------------

function showError(message) {

    errorMessage.textContent =
        message;

    errorState.classList.remove(
        "hidden"
    );


    requestAnimationFrame(
        () => {

            errorState.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );
}


function hideError() {

    errorState.classList.add(
        "hidden"
    );

    errorMessage.textContent =
        "";
}


// --------------------------------------------------
// FORM ERRORS
// --------------------------------------------------

function showFormMessage(message) {

    formMessage.textContent =
        message;

    formMessage.classList.remove(
        "hidden"
    );
}


function clearFormMessage() {

    formMessage.textContent =
        "";

    formMessage.classList.add(
        "hidden"
    );
}


// --------------------------------------------------
// RESULTS RESET
// --------------------------------------------------

function hideResults() {

    results.classList.add(
        "hidden"
    );
}


// --------------------------------------------------
// KEYBOARD SHORTCUT
// --------------------------------------------------

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            document.activeElement !== input
        ) {

            event.preventDefault();

            input.focus();

        }

    }
);
