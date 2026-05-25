const ZOHO_HOST = "zgnp-zngp.maillist-manage.com";

const RESEARCH_LIST_FIELDS = {
  submitType: "optinCustomView",
  emailReportId: "",
  formType: "QuickForm",
  zx: "1362ec729",
  zcvers: "3.0",
  oldListIds: "",
  mode: "OptinCreateView",
  zcld: "116f2aaf916892a61",
  zctd: "116f2aaf91688fb89",
  document_domain: "",
  zc_Url: ZOHO_HOST,
  new_optin_response_in: "0",
  duplicate_optin_response_in: "0",
  zc_trackCode: "ZCFORMVIEW",
  zc_formIx: "3zdab2956038849aa36b47c12c2c5f75da1e9fdac8f7047c0dc5431cf360b83bb7",
  viewFrom: "URL_ACTION",
  scriptless: "yes",
  // zc_spmSubmit intentionally omitted — Zoho's own JS removes this field before
  // submitting (see zcScptlessSubmit in optin.min.js). Its presence triggers bot detection.
};

export function submitToZohoResearchList(email: string): void {
  submitHiddenForm(email, RESEARCH_LIST_FIELDS);
}

function submitHiddenForm(
  email: string,
  fields: Record<string, string>
): void {
  try {
    const iframeName = `_zcSignup_${Date.now()}`;

    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.cssText = "display:none;width:0;height:0;border:0;position:absolute;left:-9999px";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://${ZOHO_HOST}/weboptin.zc`;
    form.target = iframeName;
    form.style.cssText = "display:none;position:absolute;left:-9999px";

    const addField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addField("CONTACT_EMAIL", email);
    for (const [k, v] of Object.entries(fields)) {
      addField(k, v);
    }

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      try { document.body.removeChild(form); } catch {}
      try { document.body.removeChild(iframe); } catch {}
    }, 5000);
  } catch (err) {
    console.warn("[Zoho] Client-side form submit failed:", err);
  }
}
