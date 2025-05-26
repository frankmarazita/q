import { createDeviceCode, exchangeDeviceCode } from "@octokit/oauth-methods";
import open from "open";
import { loadConfig, saveConfig } from "./utils";

export const CLIENT_ID = "Iv1.b507a08c87ecfe98";

export async function authenticate() {
  const c = await loadConfig();

  let deviceCode: string | undefined = undefined;

  if (!c.token) {
    const {
      data: { device_code, user_code, verification_uri, interval },
    } = await createDeviceCode({
      clientType: "oauth-app",
      clientId: CLIENT_ID,
      scopes: ["read:user"], // oauth scopes
    });

    console.log(`\nYour OAuth User Code is: ${user_code}`);

    console.log("Opening the Browser Window to Enter the User Code");

    await open(verification_uri);

    console.log("Waiting for the user to grant access through the browser ...");

    deviceCode = device_code;
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
