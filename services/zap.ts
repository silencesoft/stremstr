export const getZapEndpoint = async (lud16: string) => {
  const [name, domain] = lud16.split("@");
  const res = await fetch(`https://${domain}/.well-known/lnurlp/${name}`);
  const data = await res.json();
  return data;
};

export const createZapInvoice = async (lud16: string, amountSat: number) => {
  const zapInfo = await getZapEndpoint(lud16);
  const amountMsat = amountSat * 1000;

  const callbackUrl = new URL(zapInfo.callback);
  callbackUrl.searchParams.append("amount", amountMsat.toString());

  const res = await fetch(callbackUrl.toString());
  const data = await res.json();

  return data.pr;
};
