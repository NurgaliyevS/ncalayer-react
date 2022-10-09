import React, { useState, useEffect, useRef } from "react"
import AppState, { initAppState } from "./state"
import Client from "@seithq/ncalayer"
import Layout from "./components/Layout"
import Password from "./components/Password"
import CMSSignatureFile from "./components/CMSSignatureFile"
import Box from "./components/Fields/Box"

const App: React.FC = () => {
  // refs
  const ws = useRef<WebSocket>()

  // state
  const [ready, setReady] = useState(false)

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

  const client = new Client(ws.current!)

  return (
    <div className="App">
      <Layout ready={ready} state={state}>
        <Box>
          <CMSSignatureFile client={client} state={state} setState={setState} />
          <Password state={state} setState={setState} />
        </Box>
      </Layout>
    </div>
  )
}

export default App
