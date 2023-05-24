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
          <div className="Header-links"></div>
          <div className="Header-links"></div>
          <div className="Header-links"></div>
          <div className="Header-links"></div>

          <div className="Header-links">
            <Link
              className="Header-link"
              href="https://sugovern.github.io/sugovern-user-docs/what-is-sugovern/"
            >
              User Docs
            </Link>
          </div>
          <div className="Header-links">
            <Link
              className="Header-link"
              href="https://sugovern.github.io/sugovern-dev-docs/what-is-sugovern/"
            >
              Dev Docs
            </Link>
          </div>
          {logged ? (
            <div className="Header-link Wallet"> {account} </div>
          ) : (
            <div
              className="Wallet"
              style={{ cursor: "pointer" }}
              onClick={WalletConnect}
            >
              Connect Wallet
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
                <a
                  href="https://sugovern.github.io/sugovern-user-docs/what-is-sugovern/"
                  className="Header-link-mobile"
                >
                  User Docs
                </a>
                <a
                  href="https://sugovern.github.io/sugovern-dev-docs/what-is-sugovern/"
                  className="Header-link-mobile"
                >
                  Dev Docs
                </a>
              </div>
              {logged ? (
                <div className="Header-link Wallet">{account}</div>
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
