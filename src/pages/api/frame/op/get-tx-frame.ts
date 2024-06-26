import { NextApiRequest, NextApiResponse } from "next";
import { CoinbaseKit } from "../../../../../classes/CoinbaseKit";
import { FrameRequest } from "@coinbase/onchainkit/frame";
import { getERC721PreparedEncodedData, getFarcasterAccountAddress } from "../../../../../utils/tx-frame";
import { erc721ContractABI } from "../../../../../utils/erc721ContractABI";
import { erc721ContractAddress } from "../../../../../utils/constants";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { isValid, message } = await CoinbaseKit.validateMessage(
    req.body as FrameRequest
  );

  if (!isValid || !message) {
    return res.status(400).json({ error: "Invalid Reauest" });
  }

  const accountAddress = await getFarcasterAccountAddress(message.interactor);

  const data = await getERC721PreparedEncodedData(accountAddress);

  return res.status(200).json({
    chainId: "eip155:10",
    method: "eth_sendTransaction",
    params: {
      abi: erc721ContractABI,
      to: erc721ContractAddress,
      data: data,
      value: "0"
    }
  });
};