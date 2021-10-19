// for next.js's <head> tag and rendering images
import Head from 'next/head'

// import next/react stuff
import { useState } from 'react';

export default function Home() {

  const [ address, setAddress ] = useState("")

  function goToAddress() {
    if (address) {
      location.href = `/profile/${address}`
    }
  }

  return (
    <main className="w-full max-w-xl mx-auto p-10 text-center text-gray-700">
      <h1 className="text-3xl font-bold mb-2">Layer</h1>
      <p className="opacity-75">Add a visual layer to your ENS domain</p>

      <div className="p-10 bg-gray-100 rounded-2xl m-10">
        <label className="text-left flex flex-col mb-4">
          <p className="font-semibold">Your .eth address</p>
          <input type="text" className="py-2 px-3 rounded bg-white" onChange={e => setAddress(e.target.value)} />
        </label>
        <button onClick={goToAddress} className="bg-blue-600 text-white font-sans py-2 px-3 rounded block w-full">View profile</button>
      </div>

      <Head>
        <title>Layer</title>
        <meta property="og:title" content="Layer • Profile pages for your ENS domains" />
        <meta property="og:description" content="Turn your ENS domain into an awesome profile page" />
        <meta property="og:image" content="/social.png" />
      </Head>
    </main>
  )
}
