import { Method } from "@seithq/ncalayer"

export enum CheckState {
  NotValidated = "notValidated",
  Failed = "failed",
  OK = "ok",
}

interface AppState {
  method: Method
  version: ""
  alias: string
  path: string
  password: string
  keyType: string
  keyAlias: string
  keys: string[]
  lang: string
  notBefore: string
  notAfter: string
  subjectDN: string
  issuerDN: string
  oid: string
  rdn: string
  // cms signature form file
  cmsFilePath: string
  cmsFileSignatureFlag: boolean
  cmsFileSignatureSigned: string
  cmsFileSignatureValid: CheckState
  cmsFileSignatureMessage: string
  // // hash
  // toHash: string
  // alg: string
  // hashed: string
}

export const initAppState = (): AppState => {
  return {
    method: Method.None,
    version: "",
    alias: "PKCS12",
    path: "",
    password: "Qwerty12",
    keyType: "SIGN",
    keyAlias: "",
    keys: [],
    lang: "ru",
    notBefore: "",
    notAfter: "",
    subjectDN: "",
    issuerDN: "",
    oid: "2.5.4.3",
    rdn: "",
    // cms signature form file
    cmsFilePath: "",
    cmsFileSignatureFlag: false,
    cmsFileSignatureSigned: "",
    cmsFileSignatureValid: CheckState.NotValidated,
    cmsFileSignatureMessage: "Не проверено",
    // // hash
    // toHash: "",
    // alg: "SHA1",
    // hashed: "",
  }
}

export default AppState
