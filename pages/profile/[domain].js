// for next.js's <head> tag and rendering images
import Head from 'next/head'

// import next/react stuff
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

// Crypto stuff
import { web3 } from '/lib/web3';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import { Moralis } from "moralis"

const ens = new ENS({
  provider: web3.currentProvider,
  ensAddress: getEnsAddress("1")
})

Moralis.start({
  serverUrl: "https://yb7ulynbu9rq.bigmoralis.com:2053/server",
  appId: "02xzqmZKykr9oXrdT8XAE6qa0zkxIVOGVWxVUu3A"
})

// ==========================================

export default function Profile() {

  // ------------------------------
  // Get domain from URL
  const router = useRouter()
  const { domain } = router.query

  // ------------------------------
  // State
  const [ loading, setLoading ] = useState(true)
  const [ scrolled, setScrolled ] = useState(false)

  const [ address, setAddress ] = useState("")
  const [ truncatedAddress, setTruncatedAddress ] = useState("")
  const [ avatar, setAvatar ] = useState("")
  const [ name, setName ] = useState("")
  const [ email, setEmail ] = useState("")
  const [ description, setDescription ] = useState("")
  const [ location, setLocation ] = useState("")
  const [ url, setUrl ] = useState("")
  const [ twitter, setTwitter ] = useState("")
  const [ nfts, setNfts ] = useState([])

  const [ marqueeRepeat, setMarqueeRepeat ] = useState(2)
  const [ autoscrollRepeat, setAutoscrollRepeat ] = useState(2)
  const [ autoscrollDuration, setAutoscrollDuration ] = useState("100s")

  const [ copied, setCopied ] = useState(false)

  // ------------------------------
  // Helper functions
  
  // Get data from ENS
  async function getText(id, callback, alt = false) {
    let content = await ens.name(domain).getText(id)
    if (content) {
      callback(content)
    } else if (alt) {
      callback(alt)
    }
  }

  // Get valid image URL
  function nftImageUrl(nft) {
    let metadata = JSON.parse(nft.metadata)
    if (!metadata) return false
    let image = metadata.image || metadata.image_url
    return image ? image.replace(/ipfs\:\/\//, "https://ipfs.io/ipfs/").replace(/ipfs\/ipfs/, "ipfs") : "still no image"
  }

  // Remove failed NFT
  function removeNft(nft) {
    let updatedNfts = nfts.filter(n => n !== nft)
    setNfts(updatedNfts)
  }

  // Convert EIP link to image link
  async function getAvatarImage(address) {
    console.log("======== called getAvatarImage with", address)
    // eip155:1/erc721:0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6/2430
    const matches = address.match(/eip155\:1\/erc721\:([\d\w]+)\/([\d\w]+)/i)
    if (matches?.length > 1) {
      const nft = await Moralis.Web3API.token.getTokenIdMetadata({
        address: matches[1],
        token_id: matches[2]
      });
      console.log("fetched NFT", nft)
      let url = await nftImageUrl(nft)
      console.log("======== returned from getAvatarImage with", url)
      return url
    } else {
      console.log("======== returned from getAvatarImage with", address)
      return address
    }
  }

  function calcRepeat() {
    // Marquee
    let marqueeContainer = document.getElementsByClassName('marquee')[0]
    let marqueeTextWidth = marqueeContainer.firstChild.offsetWidth
    setMarqueeRepeat( 2 + Math.ceil(marqueeContainer.offsetWidth / marqueeTextWidth) )

    // Autoscroll
    let autoscrollContainer = document.getElementsByClassName('autoscroll')[0]
    let autoscrollContentHeight = autoscrollContainer.firstChild.offsetHeight
    setAutoscrollRepeat( 2 + Math.ceil(autoscrollContainer.offsetHeight / autoscrollContentHeight) )
    setAutoscrollDuration( 100 * (autoscrollContentHeight / window.innerHeight) + "s" )
  }

  function clipboardCopyAddress() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  // ------------------------------
  // Get data from ENS & Moralis
  useEffect(async () => {
    if (!domain) return

    await setLoading(true)

    const ensAddress = await ens.name(domain).getAddress()
    await setAddress(ensAddress)
    setTruncatedAddress(ensAddress.substr(0, 8) + "..." + ensAddress.substr(-4))

    getText("avatar", async (d) => {
      let data = await getAvatarImage(d)
      setAvatar(data)
    })
    getText("name", setName, domain)
    getText("email", setEmail)
    getText("description", setDescription)
    getText("location", setLocation)
    getText("url", setUrl)
    getText("com.twitter", setTwitter)

    let tokensQuery = await Moralis.Web3API.account.getNFTs({ address: ensAddress })
    setNfts(tokensQuery.result.filter(nft => nft.metadata))

    await setLoading(false)

    calcRepeat()

    let scrollview = document.getElementsByClassName('scrollview')[0]
    scrollview?.addEventListener('scroll', handleScroll)
    scrollview?.addEventListener('resize', handleScroll)

    return () => {
      let scrollview = document.getElementsByClassName('scrollview')[0]
      scrollview?.removeEventListener('scroll', handleScroll)
      scrollview?.removeEventListener('resize', handleScroll)
    }

  }, [ domain ])


  function handleScroll(e) {
    setScrolled(e.target.scrollTop >= e.target.offsetHeight / 2)
  }


  // ------------------------------
  // Build icon
  let icon = avatar ?
    (<img className="w-10 h-10 rounded-full border-4 border-white border-opacity-10" src={avatar} />) :
    (<Jazzicon diameter={32} seed={jsNumberForAddress(`${address}` || "")} />)


  // ------------------------------
  // Render stuff
  return (
    <main className="font-mono w-screen h-screen bg-indigo-800 fixed inset-0 flex flex-col">

      {loading ? (
        <div className="w-full h-full grid place-items-center text-white opacity-50">Loading…</div>
      ) : (
        <>

          {/* MAIN */}
          <div className="relative flex-1 m-3 mb-0 rounded-3xl bg-gray-900 text-white overflow-hidden">

            {/* Center HUD */}
            <div className="fixed z-30 top-0 left-1/2 transform -translate-x-1/2 w-80 mx-auto">
              <div className="px-24 absolute w-full h-full inset-0 flex items-center justify-center space-x-2">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-1 max-w-full pr-2">
                  <div className="text-xs opacity-50 truncate">{domain}</div>
                  <button onClick={clipboardCopyAddress} className="text-xs opacity-50 truncate">
                    {copied ? "Copied!" : truncatedAddress}
                  </button>
                </div>
              </div>
              <svg className="block w-full text-indigo-800" width="300" height="64" viewBox="0 0 300 64" fill="none">
                <path d="M10.7562 12H0V0H30H270H300V12H289.244C255.984 12 259.821 64 226.671 64H73.329C40.1793 64 44.0156 12 10.7562 12Z" fill="currentColor"/>
              </svg>
            </div>

            {/* NFT scrolling */}
            <div className="autoscroll absolute inset-0 opacity-25 pointer-events-none">
              {[...Array(autoscrollRepeat)].map((i, index) => (
                <div key={`nft-scrolling-${index}`} className="animate-scroll transform-gpu grid grid-cols-4 lg:grid-cols-2 place-items-center gap-4 lg:gap-24 p-2 lg:p-24 pb-0" style={{ animationDuration: autoscrollDuration}}>
                  {nfts.map( nft => (
                    <img className={`block w-full max-w-full transition-all duration-300 transform-gpu ${scrolled ? "opacity-0 filter blur-3xl" : "opacity-100 filter blur-0"}`} key={`${nft.token_address}-${nft.token_id}`} src={nftImageUrl(nft) || "no metadata"} />
                  ))}
                </div>
              ))}
            </div>

            <div className="scrollview w-full h-full relative z-20 overflow-x-hidden overflow-y-auto scrollbar scroll-snap">

              {/* First screen */}
              <div className="w-full h-full p-10 grid place-items-center text-center">
                <div className="max-w-3xl">
                  <h1 className="text-3xl lg:text-6xl font-bold mb-6">{name || domain}</h1>
                  <p className="text-sm lg:text-base">{description}</p>
                  {(location || url) && (
                    <p className="mt-4 text-sm">
                      {location && (<span className="block lg:inline">{location}</span>)}
                      {location && url && (<span className="hidden lg:inline"> • </span>)}
                      {url && (<a href={url} className="block lg:inline">{url}</a>)}
                    </p>
                  )}
                  <p className="flex items-center justify-center space-x-4 py-8">
                    {twitter && (
                      <a href={`https://twitter.com/${twitter}`} className="block p-2 rounded-full bg-indigo-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                  </p>
                </div>
              </div>

              {/* Gallery screen */}
              <div className="w-full min-h-full p-3 lg:p-10 grid place-items-center">
                <div className="grid grid-cols-2 lg:grid-cols-4 place-items-center gap-4 lg:gap-10 p-2 lg:p-24">
                  {nfts.map( nft => (
                    <div className="bg-black bg-opacity-25 p-2 rounded-lg">
                      <img className="block w-full max-w-full rounded mb-1" key={`${nft.token_address}-${nft.token_id}`} src={nftImageUrl(nft)} />
                      <p className="break-all text-xs lg:text-sm">{nft.name}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* MARQUEE */}
          <div className="marquee whitespace-nowrap text-white opacity-50 py-2">
            {[...Array(marqueeRepeat)].map((i, index) => (
              <span key={`marquee-item-${index}`} className="text-sm lg:text-base inline-block animate-marquee transform-gpu">
                {address}&nbsp;•&nbsp;
              </span>
            ))}
          </div>

        </>
      )}

      <Head>
        <title>Layer</title>
        <meta property="og:title" content="Layer • Profile pages for your ENS domains" />
        <meta property="og:description" content="Turn your ENS domain into an awesome profile page" />
        <meta property="og:image" content="/social.png" />
      </Head>
    </main>
  )
}
