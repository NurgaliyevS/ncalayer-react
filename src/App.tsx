import React, { useState, useEffect, useRef } from "react"
import AppState, { initAppState } from "./state"
import NCALayer, { MethodName } from "./ncalayer"
import Response, { ValidationType } from "./response"
import { isNullOrEmpty, extractKeyAlias, checkInputs } from "./helper"
import Error from "./components/Error"
import Status from "./components/Status"
import StorageAlias from "./components/StorageAlias"
import StoragePath from "./components/StoragePath"
import Password from "./components/Password"
import KeyType from "./components/KeyType"
import KeyList from "./components/KeyList"
import Locale from "./components/Locale"
import NotBefore from "./components/NotBefore"
import NotAfter from "./components/NotAfter"
import SubjectDN from "./components/SubjectDN"
import IssuerDN from "./components/IssuerDN"
import RDNSelector from "./components/RDNSelector"
import PlainData from "./components/PlainData"
import CMSSignature from "./components/CMSSignature"
import CMSSignatureFile from "./components/CMSSignatureFile"
import XML from "./components/XML"
import XMLNode from "./components/XMLNode"
import Hasher from "./components/Hasher"

const App: React.FC = () => {
  // refs
  const ws = useRef<WebSocket>()

  // state
  const [ready, setReady] = useState(false)
  // const [method, setMethod] = useState<MethodName>(MethodName.None)

  // input state
  const [state, setState] = useState<AppState>(initAppState())

  // setup ws
  useEffect(() => {
    ws.current = new WebSocket("wss://127.0.0.1:13579/")

    ws.current.onopen = e => {
      // tslint:disable-next-line
      console.log("connection opened")
      setReady(true)
    }

    ws.current.onclose = e => {
      if (e.wasClean) {
        // tslint:disable-next-line
        console.log("connection closed")
      } else {
        // tslint:disable-next-line
        console.log(
          "connection error: [code]=" + e.code + ", [reason]=" + e.reason
        )
      }
      setReady(false)
    }

    return () => {
      ws.current!.close()
    }
  }, [setReady])

  // set onmessage
  useEffect(() => {
    const browseKeyStoreCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, path: resp.GetResult() })
      }
    }

    const showFileChooserCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, cmsFilePath: resp.GetResult() })
      }
    }

    const getKeysCallback = (resp: Response) => {
      if (resp.IsOK()) {
        const k: string[] = []
        resp
          .GetResult()
          .split("\n")
          .forEach(el => {
            if (isNullOrEmpty(el)) {
              return
            }
            k.push(el)
          })
        setState({
          ...state,
          keys: k,
          keyAlias: k.length > 0 ? extractKeyAlias(k[0]) : "",
        })

        return
      }

      setState({ ...state, keys: [], keyAlias: "" })
      resp.HandleError(
        ValidationType.Password &&
          ValidationType.PasswordAttemps &&
          ValidationType.KeyType
      )
    }

    const getNotBeforeCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, notBefore: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const getNotAfterCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, notAfter: resp.GetResult() })
        return
      }
      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const getSubjectDNCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, subjectDN: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const getIssuerDNCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, issuerDN: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const getRdnByOidCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, rdn: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password &&
          ValidationType.PasswordAttemps &&
          ValidationType.RDN
      )
    }

    const signPlainDataCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, plainDataSigned: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const verifyPlainDataCallback = (resp: Response) => {
      if (resp.IsOK()) {
        if (!resp.GetResult()) {
          setState({
            ...state,
            plainDataValid: false,
            plainDataMessage: "Неправильная подпись",
          })
          return
        }

        setState({
          ...state,
          plainDataValid: true,
          plainDataMessage: "Валидная подпись",
        })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const createCMSSignatureCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, cmsSignatureSigned: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const verifyCMSSignatureCallback = (resp: Response) => {
      if (resp.IsOK()) {
        if (!resp.GetResult()) {
          setState({
            ...state,
            cmsSignatureValid: false,
            cmsSignatureMessage: "Неправильная подпись",
          })
          return
        }

        setState({
          ...state,
          cmsSignatureValid: true,
          cmsSignatureMessage: "Валидная подпись",
        })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const createCMSSignatureFromFileCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, cmsFileSignatureSigned: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const verifyCMSSignatureFromFileCallback = (resp: Response) => {
      if (resp.IsOK()) {
        if (!resp.GetResult()) {
          setState({
            ...state,
            cmsFileSignatureValid: false,
            cmsFileSignatureMessage: "Неправильная подпись",
          })
          return
        }

        setState({
          ...state,
          cmsFileSignatureValid: true,
          cmsFileSignatureMessage: "Валидная подпись",
        })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const signXmlCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, xmlSigned: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const verifyXmlCallback = (resp: Response) => {
      if (resp.IsOK()) {
        if (!resp.GetResult()) {
          setState({
            ...state,
            xmlValid: false,
            xmlMessage: "Неправильная подпись",
          })
          return
        }

        setState({
          ...state,
          xmlValid: true,
          xmlMessage: "Валидная подпись",
        })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const signXmlByElementIdCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, xmlNodeSigned: resp.GetResult() })
        return
      }

      resp.HandleError(
        ValidationType.Password && ValidationType.PasswordAttemps
      )
    }

    const verifyXmlByElementIdCallback = (resp: Response) => {
      if (resp.IsOK()) {
        if (!resp.GetResult()) {
          setState({
            ...state,
            xmlNodeValid: false,
            xmlNodeMessage: "Неправильная подпись",
          })
          return
        }

        setState({
          ...state,
          xmlNodeValid: true,
          xmlNodeMessage: "Валидная подпись",
        })
        return
      }

      resp.HandleError(
        ValidationType.Password &&
          ValidationType.PasswordAttemps &&
          ValidationType.Signature
      )
    }

    const getHashCallback = (resp: Response) => {
      if (resp.IsOK()) {
        setState({ ...state, hashed: resp.GetResult() })
        return
      }

      resp.HandleError(ValidationType.Common)
    }

    ws.current!.onmessage = e => {
      if (e.data === "--heartbeat--") {
        return
      }

      const data = JSON.parse(e.data)
      if (data !== null) {
        const resp = new Response(
          data.result,
          data.secondResult,
          data.errorCode
        )

        switch (state.method) {
          case MethodName.BrowseKeyStore:
            browseKeyStoreCallback(resp)
            break
          case MethodName.ShowFileChooser:
            showFileChooserCallback(resp)
            break
          case MethodName.GetKeys:
            getKeysCallback(resp)
            break
          case MethodName.GetNotBefore:
            getNotBeforeCallback(resp)
            break
          case MethodName.GetNotAfter:
            getNotAfterCallback(resp)
            break
          case MethodName.GetSubjectDN:
            getSubjectDNCallback(resp)
            break
          case MethodName.GetIssuerDN:
            getIssuerDNCallback(resp)
            break
          case MethodName.GetRdnByOid:
            getRdnByOidCallback(resp)
            break
          case MethodName.SignPlainData:
            signPlainDataCallback(resp)
            break
          case MethodName.VerifyPlainData:
            verifyPlainDataCallback(resp)
            break
          case MethodName.CreateCMSSignature:
            createCMSSignatureCallback(resp)
            break
          case MethodName.VerifyCMSSignature:
            verifyCMSSignatureCallback(resp)
            break
          case MethodName.CreateCMSSignatureFromFile:
            createCMSSignatureFromFileCallback(resp)
            break
          case MethodName.VerifyCMSSignatureFromFile:
            verifyCMSSignatureFromFileCallback(resp)
            break
          case MethodName.SignXml:
            signXmlCallback(resp)
            break
          case MethodName.VerifyXml:
            verifyXmlCallback(resp)
            break
          case MethodName.SignXmlByElementId:
            signXmlByElementIdCallback(resp)
            break
          case MethodName.VerifyXmlByElementId:
            verifyXmlByElementIdCallback(resp)
            break
          case MethodName.GetHash:
            getHashCallback(resp)
            break
          default:
            // tslint:disable-next-line
            console.log(e)
            const payload = JSON.parse(e.data)
            if (payload.result.version) {
              setState({ ...state, version: payload.result.version })
            }
            break
        }
      }
    }
  }, [state, setState])

  // NCALayer client
  const client = new NCALayer(ws.current!)

  // handlers

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, password: e.target.value })
  }

  const handleKeyTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, keyType: e.target.value })
  }

  const handleKeyAliasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, keyAlias: extractKeyAlias(e.target.value) })
  }

  const handleKeyAliasClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetKeys(
          state.alias,
          state.path,
          state.password,
          state.keyType
        ),
      })
    }
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, lang: e.target.value })
  }

  const handleLangClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setState({ ...state, method: client.SetLocale(state.lang) })
  }

  const handleNotBeforeClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetNotBefore(
          state.alias,
          state.path,
          state.keyAlias,
          state.password
        ),
      })
    }
  }

  const handleNotAfterClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetNotAfter(
          state.alias,
          state.path,
          state.keyAlias,
          state.password
        ),
      })
    }
  }

  const handleSubjectDNClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetSubjectDN(
          state.alias,
          state.path,
          state.keyAlias,
          state.password
        ),
      })
    }
  }

  const handleIssuerDNClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetIssuerDN(
          state.alias,
          state.path,
          state.keyAlias,
          state.password
        ),
      })
    }
  }

  const handleOIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, oid: e.target.value })
  }

  const handleRDNClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.GetRdnByOid(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.oid,
          0
        ),
      })
    }
  }

  const handlePlainDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, plainData: e.target.value })
  }

  const handlePlainDataClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        plainDataValid: false,
        plainDataMessage: "Не проверено",
        method: client.SignPlainData(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.plainData
        ),
      })
    }
  }

  const handlePlainDataVerify = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.VerifyPlainData(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.plainData,
          state.plainDataSigned
        ),
      })
    }
  }

  const handleCMSSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, cmsSignature: e.target.value })
  }

  const handleCMSSignatureToggle = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    setState({ ...state, cmsSignatureFlag: e.currentTarget.checked })
  }

  const handleCMSSignatureClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        cmsSignatureValid: false,
        cmsSignatureMessage: "Не проверено",
        method: client.CreateCMSSignature(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.cmsSignature,
          state.cmsSignatureFlag
        ),
      })
    }
  }

  const handleCMSSignatureVerify = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.VerifyCMSSignature(
          state.cmsSignatureSigned,
          state.cmsSignature
        ),
      })
    }
  }

  const handleCMSSignatureFromFileChoose = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setState({ ...state, method: client.ShowFileChooser("ALL", "") })
  }

  const handleCMSSignatureFromFileToggle = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    setState({ ...state, cmsFileSignatureFlag: e.currentTarget.checked })
  }

  const handleCMSSignatureFromFileClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        cmsFileSignatureValid: false,
        cmsFileSignatureMessage: "Не проверено",
        method: client.CreateCMSSignatureFromFile(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.cmsFilePath,
          state.cmsFileSignatureFlag
        ),
      })
    }
  }

  const handleCMSSignatureFromFileVerify = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.VerifyCMSSignatureFromFile(
          state.cmsFileSignatureSigned,
          state.cmsFilePath
        ),
      })
    }
  }

  const handleXmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, xml: e.target.value })
  }

  const handleXmlClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        xmlValid: false,
        xmlMessage: "Не проверено",
        method: client.SignXml(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.xml
        ),
      })
    }
  }

  const handleXmlVerify = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({ ...state, method: client.VerifyXml(state.xmlSigned) })
    }
  }

  const handleXmlNodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, xmlNode: e.target.value })
  }

  const handleXmlNodeElementChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, xmlNodeElement: e.target.value })
  }

  const handleXmlNodeAttributeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, xmlNodeAttribute: e.target.value })
  }

  const handleXmlNodeParentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, xmlNodeParent: e.target.value })
  }

  const handleXmlNodeClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
      elementName: state.xmlNodeElement,
      attribute: state.xmlNodeAttribute,
    })
    if (ok) {
      setState({
        ...state,
        xmlNodeValid: false,
        xmlNodeMessage: "Не проверено",
        method: client.SignXmlByElementId(
          state.alias,
          state.path,
          state.keyAlias,
          state.password,
          state.xmlNode,
          state.xmlNodeElement,
          state.xmlNodeAttribute,
          state.xmlNodeParent
        ),
      })
    }
  }

  const handleXmlNodeVerifyAttributeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, xmlNodeVerifyAttribute: e.target.value })
  }

  const handleXmlNodeVerifyParentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState({ ...state, xmlNodeVerifyParent: e.target.value })
  }

  const handleXmlNodeVerify = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const ok = checkInputs({
      path: state.path,
      alias: state.alias,
      password: state.password,
      keyAlias: state.keyAlias,
    })
    if (ok) {
      setState({
        ...state,
        method: client.VerifyXmlByElementId(
          state.xmlNodeSigned,
          state.xmlNodeVerifyAttribute,
          state.xmlNodeVerifyParent
        ),
      })
    }
  }

  const handleAlgSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ ...state, alg: e.target.value })
  }

  const handleHashDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, toHash: e.target.value })
  }

  const handleHashClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setState({ ...state, method: client.GetHash(state.toHash, state.alg) })
  }

  if (!ready) {
    return <Error />
  }

  return (
    <div className="App">
      <Status ready={ready} version={state.version} />
      <StorageAlias client={client} state={state} setState={setState} />
      <StoragePath path={state.path} />
      <Password onChange={handlePasswordChange} />
      <KeyType selected={state.keyType} onChange={handleKeyTypeChange} />
      <KeyList
        keys={state.keys}
        onChange={handleKeyAliasChange}
        onClick={handleKeyAliasClick}
      />
      <Locale
        selected={state.lang}
        onChange={handleLangChange}
        onClick={handleLangClick}
      />
      <NotBefore value={state.notBefore} onClick={handleNotBeforeClick} />
      <NotAfter value={state.notAfter} onClick={handleNotAfterClick} />
      <SubjectDN value={state.subjectDN} onClick={handleSubjectDNClick} />
      <IssuerDN value={state.issuerDN} onClick={handleIssuerDNClick} />
      <RDNSelector
        value={state.rdn}
        selected={state.oid}
        onChange={handleOIDChange}
        onClick={handleRDNClick}
      />
      <PlainData
        signed={state.plainDataSigned}
        valid={state.plainDataValid}
        message={state.plainDataMessage}
        onChange={handlePlainDataChange}
        onClick={handlePlainDataClick}
        onVerify={handlePlainDataVerify}
      />
      <CMSSignature
        signed={state.cmsSignatureSigned}
        valid={state.cmsSignatureValid}
        message={state.cmsSignatureMessage}
        onChange={handleCMSSignatureChange}
        onToggle={handleCMSSignatureToggle}
        onClick={handleCMSSignatureClick}
        onVerify={handleCMSSignatureVerify}
      />
      <CMSSignatureFile
        filePath={state.cmsFilePath}
        signed={state.cmsFileSignatureSigned}
        valid={state.cmsFileSignatureValid}
        message={state.cmsFileSignatureMessage}
        onChoose={handleCMSSignatureFromFileChoose}
        onToggle={handleCMSSignatureFromFileToggle}
        onClick={handleCMSSignatureFromFileClick}
        onVerify={handleCMSSignatureFromFileVerify}
      />
      <XML
        defaultXML={state.xml}
        signed={state.xmlSigned}
        valid={state.xmlValid}
        message={state.xmlMessage}
        onChange={handleXmlChange}
        onClick={handleXmlClick}
        onVerify={handleXmlVerify}
      />
      <XMLNode
        defaultXML={state.xmlNode}
        signed={state.xmlNodeSigned}
        valid={state.xmlNodeValid}
        message={state.xmlNodeMessage}
        onChange={handleXmlNodeChange}
        onElementChange={handleXmlNodeElementChange}
        onIdAttrChange={handleXmlNodeAttributeChange}
        onParentElementChange={handleXmlNodeParentChange}
        onClick={handleXmlNodeClick}
        onVerifyIdAttrChange={handleXmlNodeVerifyAttributeChange}
        onVerifyParentElementChange={handleXmlNodeVerifyParentChange}
        onVerify={handleXmlNodeVerify}
      />
      <Hasher
        selected={state.alg}
        hashed={state.hashed}
        onSelect={handleAlgSelect}
        onChange={handleHashDataChange}
        onClick={handleHashClick}
      />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

export default App
