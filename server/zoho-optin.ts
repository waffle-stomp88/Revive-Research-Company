const ZOHO_HOST = "zgnp-zngp.maillist-manage.com";

export interface ZohoListConfig {
  zcld: string;
  zctd: string;
  zc_formIx: string;
  label: string;
}

export const ZOHO_RESEARCH_LIST: ZohoListConfig = {
  zcld: "116f2aaf916892a61",
  zctd: "116f2aaf91688fb89",
  zc_formIx: "3zdab2956038849aa36b47c12c2c5f75da1e9fdac8f7047c0dc5431cf360b83bb7",
  label: "Research List",
};

export const ZOHO_WAITLIST_LIST: ZohoListConfig | null = (() => {
  const zcld = process.env.ZOHO_WAITLIST_ZCLD;
  const zctd = process.env.ZOHO_WAITLIST_ZCTD;
  const zc_formIx = process.env.ZOHO_WAITLIST_FORMIX;
  if (!zcld || !zctd || !zc_formIx) return null;
  return { zcld, zctd, zc_formIx, label: "Waitlist" };
})();

interface ZohoPushResult {
  success: boolean;
  newContact: boolean;
  duplicate: boolean;
  rawResponse?: string;
  error?: string;
}

export async function pushToZohoList(
  email: string,
  list: ZohoListConfig
): Promise<ZohoPushResult> {
  const preflight = await fetchPreflightValues(list.zc_formIx);

  const params = new URLSearchParams({
    CONTACT_EMAIL: email,
    submitType: "optinCustomView",
    emailReportId: "",
    formType: "QuickForm",
    zx: "1362ec729",
    zcvers: "3.0",
    oldListIds: "",
    mode: "OptinCreateView",
    zcld: list.zcld,
    zctd: list.zctd,
    document_domain: "",
    zc_Url: ZOHO_HOST,
    new_optin_response_in: preflight.new_optin_response_in,
    duplicate_optin_response_in: preflight.duplicate_optin_response_in,
    zc_trackCode: "ZCFORMVIEW",
    zc_formIx: list.zc_formIx,
    viewFrom: "URL_ACTION",
    scriptless: "yes",
  });

  let httpStatus: number;
  let bodyText: string;
  try {
    const response = await fetch(`https://${ZOHO_HOST}/weboptin.zc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: `https://${ZOHO_HOST}/`,
        Origin: `https://${ZOHO_HOST}`,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(8000),
    });
    httpStatus = response.status;
    bodyText = await response.text();
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error(`[Zoho] ${list.label} network error for ${email}: ${msg}`);
    return { success: false, newContact: false, duplicate: false, error: `Network error: ${msg}` };
  }

  const jsonMatch = bodyText.match(/##ZCJSONSTART##(.*?)##ZCJSON##/s);
  if (!jsonMatch) {
    console.error(`[Zoho] ${list.label} unexpected response for ${email} — HTTP ${httpStatus} — body: ${bodyText.slice(0, 300)}`);
    return {
      success: false,
      newContact: false,
      duplicate: false,
      rawResponse: bodyText.slice(0, 300),
      error: `Unexpected response format (HTTP ${httpStatus})`,
    };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[1].replace(/&#34;/g, '"'));
  } catch {
    return {
      success: false,
      newContact: false,
      duplicate: false,
      rawResponse: jsonMatch[1].slice(0, 300),
      error: "Could not parse Zoho response JSON",
    };
  }

  const optinResponse = Number(parsed["ZC_NEWOPTINRESPONSE"] ?? -1);
  const isNew = parsed["isNewContact"] === true || parsed["isNewContact"] === "true";

  console.log(
    `[Zoho] ${list.label} — ${email} — ZC_NEWOPTINRESPONSE: ${optinResponse} — isNewContact: ${isNew}`
  );

  if (optinResponse === 1) {
    return { success: true, newContact: true, duplicate: false };
  }
  if (optinResponse === 2) {
    return { success: true, newContact: false, duplicate: true };
  }
  if (optinResponse === 0) {
    return {
      success: false,
      newContact: false,
      duplicate: false,
      rawResponse: jsonMatch[1].slice(0, 300),
      error: "Zoho did not accept the submission (ZC_NEWOPTINRESPONSE: 0). Check Zoho list settings.",
    };
  }

  return {
    success: false,
    newContact: false,
    duplicate: false,
    rawResponse: jsonMatch[1].slice(0, 300),
    error: `Unexpected ZC_NEWOPTINRESPONSE value: ${optinResponse}`,
  };
}

async function fetchPreflightValues(formIx: string): Promise<{
  new_optin_response_in: string;
  duplicate_optin_response_in: string;
}> {
  const defaults = { new_optin_response_in: "0", duplicate_optin_response_in: "0" };
  try {
    const url = `https://${ZOHO_HOST}/ua/Optin?r=t&zc_formIx=${encodeURIComponent(formIx)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: `https://${ZOHO_HOST}/`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return defaults;
    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return defaults;
    }
    return {
      new_optin_response_in:
        data["new_optin_response_in"] != null ? String(data["new_optin_response_in"]) : "0",
      duplicate_optin_response_in:
        data["duplicate_optin_response_in"] != null
          ? String(data["duplicate_optin_response_in"])
          : "0",
    };
  } catch {
    return defaults;
  }
}
