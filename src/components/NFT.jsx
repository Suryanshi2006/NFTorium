import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ABI from "../utils/ABI.json";
import { ethers, Contract } from "ethers";
import Address from "../utils/Address.json";
import Button from "./Button";

const NFT = () => {
  const tokenId = useParams().id;
  // const { provider } = useContext(MyContext);
  const abi = ABI.abi;
  const contractAddress = Address.contractAddress;

  const [nftimg, setnftimg] = useState(null);
  const [owner, setOwner] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reSellPrice, setReSellPrice] = useState(null);
  const [price, setPrice] = useState(null);
  const [name, setName] = useState(null);
  const [desc, setDesc] = useState(null);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);
  const [relistMessage, setRelistMessage] = useState(null);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [address, setAddress] = useState(null);
  const [pricePop, setPricePop] = useState(null);
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();
  let provider;

  const getNFTImage = async () => {
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAddress(signer.address);
    const contract = new Contract(contractAddress, abi, signer);
    const res = await contract.tokenURI(tokenId);

    const fetchedData = await fetch(res);
    const jsonData = await fetchedData.json();

    jsonData.image ? setnftimg(jsonData.image) : setnftimg(jsonData.img_url);

    setOwner(await contract.ownerOf(tokenId));
    const details = await contract.getListedTokenForId(tokenId);

    setName(jsonData.name);
    setResult(details);
    setSeller(details.seller);
    const wei = details.price;
    setPrice(wei);
    setDesc(jsonData.description);

    try {
      let priceETH = ethers.formatEther(wei.toString());
      setDisplayPrice(priceETH);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRelistNFT = async () => {
    if (reSellPrice == null || reSellPrice <= 0) return;
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    if (owner == signer.address) {
      let valueInWei = "0";
      if (reSellPrice != null) {
        valueInWei = ethers.parseEther(reSellPrice.toString());
      }
      const contract = new Contract(contractAddress, abi, signer);
      const res = await contract.relistToken(tokenId, valueInWei, {
        value: ethers.parseEther("0.01"),
      });
      setRelistMessage("Listed");
      await res.wait(2);
      // setOwner(await contract.ownerOf(tokenId));
      navigate("/profile");
    }
  };

  const handleBuyNFT = async () => {
    try {
      setMessage("Processing...");

      provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      const contract = new Contract(contractAddress, abi, signer);

      const balance = await provider.getBalance(signer.address);

      if (balance < price) {
        setAlert(true);
        setMessage("Insufficient funds");

        setTimeout(() => {
          setAlert(false);
          setMessage(null);
        }, 3000);

        return;
      }

      const tx = await contract.executeSale(tokenId, {
        value: price,
      });

      setMessage("Transaction submitted...");

      await tx.wait(2);

      setMessage("Listed");

      setOwner(await contract.ownerOf(tokenId));

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {

      let errorMessage = "Transaction failed";

      if (err.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds to complete the purchase";
      } else if (err.code === "ACTION_REJECTED") {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("gas")) {
        errorMessage = "Insufficient gas funds";
      }

      setAlert(true);

      setMessage(errorMessage);

      setTimeout(() => {
        setAlert(false);
        setMessage(null);
      }, 3000);
    }
  };

  useEffect(() => {
    getNFTImage();
  }, []);

  return (
    <div className="px-16 py-20 bg-black ">
      <section className="antialiased bg-white md:py-16 dark:bg-black">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="max-w-md mx-auto shrink-0 lg:max-w-lg">
              <img className="w-full dark:hidden" src={nftimg} alt="" />
              <img className="hidden w-full dark:block" src={nftimg} alt="" />
            </div>

            <div className="mt-6 sm:mt-8 lg:mt-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                {name}
              </h1>
              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                  {displayPrice} ETH
                </p>
              </div>

              <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                <a
                  href="#"
                  title=""
                  className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  role="button"
                >
                  <svg
                    className="w-5 h-5 -ms-2 me-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                    />
                  </svg>
                  Add to favorites
                </a>

                <a
                  href="#"
                  title=""
                  className="text-white mt-4 sm:mt-0 bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 flex items-center justify-center"
                  role="button"
                >
                  <svg
                    className="w-5 h-5 -ms-2 me-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                    />
                  </svg>
                  Add to cart
                </a>
              </div>
              <div className="flex w-full pt-10 pb-4 ">
                {owner == address ? (
                  <div className="relative w-1/2 mr-4">
                    <Button
                      text="Sell NFT"
                      className={"p-4"}
                      onClick={() => setPricePop(true)}
                    />
                    {pricePop == true ? (
                      <div className="absolute -top-10 left-0 z-50 w-full h-[150px] flex flex-col justify-center bg-neutral-900 p-2">
                        <label className="text-white">Enter Price</label>
                        <input
                          className="w-full rounded-md bg-neutral-900 my-2 border-[1px] p-2"
                          type="number"
                          onChange={(e) => setReSellPrice(e.target.value)}
                        />{" "}
                        <div className="flex ">
                          <Button
                            className={"w-full mr-1"}
                            text={"Sell !"}
                            onClick={handleRelistNFT}
                          />
                          <div
                            className="flex items-center justify-center w-full ml-1 font-semibold text-white bg-black rounded-lg cursor-pointer"
                            onClick={() => setPricePop(false)}
                          >
                            X{" "}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <button
                    className={
                      "w-1/2 bg-neutral-700 text-white p-4 font-semibold  mr-4 rounded-md cursor-default"
                    }
                  >
                    Sell NFT
                  </button>
                )}
                {result?.currentlyListed == true ? (
                  <Button
                    text="Buy NFT"
                    className={"w-1/2"}
                    onClick={handleBuyNFT}
                  />
                ) : (
                  <button
                    className={
                      "w-1/2 bg-neutral-700 text-white p-4 font-semibold  mr-4 rounded-md cursor-default"
                    }
                  >
                    Buy NFT
                  </button>
                )}
              </div>

              {message == "Listed" ? (
                <div
                  className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
                  role="alert"
                >
                  <span className="font-medium">Wait !</span> Transfering ownership
                </div>
              ) : (
                <></>
              )}

              {message && (
                <div
                  className={`absolute p-4 mb-4 text-sm rounded-lg z-100 top-20 ${message.includes("failed") || message.includes("Insufficient") ? "text-red-800 bg-blue-50 dark:bg-gray-800 dark:text-red-500" : message.includes("successful") ? "text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400" : "text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400"}`}
                  role="alert"
                >
                  <span className="font-medium">
                    {message.includes("failed") || message.includes("Insufficient")
                      ? "Error! "
                      : message.includes("successful")
                        ? "Success! "
                        : "Processing! "}
                  </span>
                  {message}
                </div>
              )}
              <hr className="my-6 border-gray-200 md:my-8 dark:border-gray-800" />

              <p className="mb-6 text-gray-500 dark:text-gray-400">{desc}</p>

              <p className="text-gray-500 dark:text-gray-400">
                <div>Owner : {owner} </div>
                <div>Seller : {seller} </div>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NFT;
