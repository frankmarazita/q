import { createDeviceCode, exchangeDeviceCode } from "@octokit/oauth-methods";
import open from "open";
import { loadConfig, saveConfig } from "../services/config";
import { toString as qr } from "qrcode";

export const CLIENT_ID = "Iv1.b507a08c87ecfe98";

export async function authenticate() {
  const c = await loadConfig();

  let deviceCode: string | undefined = undefined;

  if (!c.token) {
    const {
      data: { device_code, user_code, verification_uri },
    } = await createDeviceCode({
      clientType: "oauth-app",
      clientId: CLIENT_ID,
      scopes: ["read:user"], // oauth scopes
    });

    console.log("Authenticate with your GitHub account to use the CLI.\n");

    qr(verification_uri, { type: "terminal" }, (err: any, url: string) => {
      if (err) throw err;
      console.log(url);
    });

    await open(verification_uri);

    console.log(verification_uri + "\n");

    console.log(`Your User Code is: ${user_code}\n`);

    console.log("Opening the Browser Window ...\n");

    await new Promise<void>((resolve) => {
      const pollForToken = async () => {
        try {
          const { authentication } = await exchangeDeviceCode({
            clientType: "oauth-app",
            clientId: CLIENT_ID,
            code: device_code,
          });

          if (authentication.token) {
            console.log("Access granted. Token received.\n");
            await saveConfig({ token: authentication.token });
            resolve();
          }
        } catch (_error) {
          setTimeout(pollForToken, 5000); // Retry every 5 seconds
        }
      };

      pollForToken();
    });

    return;
  }

  if (deviceCode) {
    const { authentication } = await exchangeDeviceCode({
      clientType: "oauth-app",
      clientId: CLIENT_ID,
      code: deviceCode,
    });

    if (authentication.token) {
      console.log("Access granted. Token received.");
      await saveConfig({ token: authentication.token });
    } else {
      throw new Error("Access denied. No token received.");
    }
  }
}
