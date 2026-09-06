// --------------------------------------------------
// Discord Webhook
// --------------------------------------------------

const DISCORD_WEBHOOK_URL =
    "PASTE_YOUR_NEW_WEBHOOK_URL_HERE";


// --------------------------------------------------
// Website Loaded Notification
// --------------------------------------------------

export async function sendWebsiteLoadedNotification() {

    if (
        !DISCORD_WEBHOOK_URL ||
        DISCORD_WEBHOOK_URL ===
            "PASTE_YOUR_NEW_WEBHOOK_URL_HERE"
    ) {
        console.warn(
            "Discord webhook URL has not been configured."
        );

        return;
    }


    const now =
        new Date();


    const embed = {

        title: "🌐 Website Loaded",

        description:
            "The domain lookup website was loaded.",

        timestamp:
            now.toISOString(),

        footer: {
            text: "Private Domain Lookup"
        }

    };


    try {

        const response =
            await fetch(
                DISCORD_WEBHOOK_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        username:
                            "Website Monitor",

                        embeds: [
                            embed
                        ]

                    })
                }
            );


        if (!response.ok) {

            console.error(
                "Discord webhook failed:",
                response.status,
                response.statusText
            );

            return;
        }


        console.log(
            "Website load notification sent."
        );

    } catch (error) {

        console.error(
            "Discord webhook error:",
            error
        );

    }

}
