import React, { useState, useEffect } from "react"
import { IconMenu2, IconX } from "@tabler/icons"
import { WalletConnect } from "@/helpers/UserHelper"
import Link from "next/link"

function Header({ logged }) {
  const [hamburger, setHamburger] = useState(false)
  const [account, setAccount] = useState(null)
  const [loaded, setLoaded] = useState(false) //to check if the page is loaded, i.e. all the DAOs are fetched from the blockchain

  useEffect(() => {
    if (!loaded) {
      WalletConnect().then((res) => {
        setAccount(res)
      })
    }
  }, [])

  const handleHamburger = () => {
    setHamburger(!hamburger)
  }

  return (
    <>
      <div className="Header-container"></div>
      <div className="Header">
        <div className="Header-web">
          <Link href="/" className="Header-logo">
            SUGovern
          </Link>
          <div className="Header-links">
            <Link href="/projects" className="Header-link">
              Projects
            </Link>
            <Link className="Header-link" href="/docs">
              Wiki
            </Link>
          </div>
          {logged ? (
            <div className="Header-link Wallet"> {account} </div>
          ) : (
            // TODO: Disconnect ekle ve ikonlastir
            <div
              className="Wallet"
              style={{ cursor: "pointer" }}
              onClick={WalletConnect}
            >
              Wallet Connect
            </div>
          )}
        </div>

        {hamburger ? (
          <div className="Header-mobile hamburger-active">
            <div className="Header-mobile-top">
              <Link href="/" className="Header-logo">
                SUGovern
              </Link>
              <div className="Header-hamburger" onClick={handleHamburger}>
                {hamburger ? (
                  <IconX width={32} height={32} />
                ) : (
                  <IconMenu2 width={32} height={32} />
                )}
              </div>
            </div>
            <div className="Header-links-mobile">
              <div className="Header-links-mobile-links">
                <a href="/projects" className="Header-link-mobile">
                  Projects
                </a>
              </div>
              {logged ? (
                <div className="Wallet">Connected</div>
              ) : (
                <div className="Wallet" onClick={WalletConnect}>
                  Wallet Connect
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="Header-mobile">
            <div className="Header-mobile-top">
              <Link href="/" className="Header-logo">
                SUGovern
              </Link>
              <div className="Header-hamburger" onClick={handleHamburger}>
                {hamburger ? (
                  <IconX width={32} height={32} />
                ) : (
                  <IconMenu2 width={32} height={32} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Header
