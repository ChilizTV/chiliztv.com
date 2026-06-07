import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { SelfAppDisclosureConfig } from "@selfxyz/common";
import {
    countryCodes,
    SelfBackendVerifier,
    AllIds,
    DefaultConfigStore,
    VerificationConfig,
} from "@selfxyz/core";
import { whitelistAbi } from "@/lib/contracts/abis/whitelist"; // Ensure this path and ABI are correct

export async function POST(req: NextRequest) {
    console.log("Received request");
    try {
        const { attestationId, proof, publicSignals, userContextData } =
        await req.json();

        if (!proof || !publicSignals || !attestationId || !userContextData) {
        return NextResponse.json(
            {
            status: "error",
            result: false,
            reason:
                "Proof, publicSignals, attestationId and userContextData are required",
            error_code: "INVALID_INPUTS",
            },
            { status: 200 }
        );
        }

        const disclosures_config: VerificationConfig = {
        excludedCountries: [],
        ofac: false,
        minimumAge: 18,
        };

        const configStore = new DefaultConfigStore(disclosures_config);

        const selfBackendVerifier = new SelfBackendVerifier(
        "betcast",
        process.env.NEXT_PUBLIC_SELF_ENDPOINT ?? "",
        true,
        AllIds,
        configStore,
        "hex"
        );

        const result = await selfBackendVerifier.verify(
        attestationId,
        proof,
        publicSignals,
        userContextData
        );

        if (!result.isValidDetails.isValid) {
        return NextResponse.json(
            {
            status: "error",
            result: false,
            reason: "Verification failed",
            error_code: "VERIFICATION_FAILED",
            details: result.isValidDetails,
            },
            { status: 200 }
        );
        }

        // Whitelist the user on-chain using ethers.js
        const userAddress = result.userData?.userDefinedData;
        if (!userAddress) {
        return NextResponse.json(
            {
            status: "error",
            result: false,
            reason: "User wallet address is missing",
            error_code: "MISSING_WALLET_ADDRESS",
            },
            { status: 200 }
        );
        }

        try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        const whitelistContract = new ethers.Contract(
            process.env.WHITELIST_CONTRACT_ADDRESS!,
            whitelistAbi,
            wallet
        );

        const tx = await whitelistContract.whitelist(userAddress);
        await tx.wait();
        console.log("Whitelisted user:", userAddress);
        } catch (contractError) {
        console.error("Smart contract call failed:", contractError);
        return NextResponse.json(
            {
            status: "error",
            result: false,
            reason: "Contract write failed",
            error_code: "CONTRACT_WRITE_FAILED",
            },
            { status: 200 }
        );
        }

        const saveOptions = (await configStore.getConfig(
        result.userData.userIdentifier
        )) as unknown as SelfAppDisclosureConfig;

        return NextResponse.json({
        status: "success",
        result: true,
        credentialSubject: result.discloseOutput,
        verificationOptions: {
            minimumAge: saveOptions.minimumAge,
            ofac: saveOptions.ofac,
            excludedCountries: saveOptions.excludedCountries?.map(
            (countryName) => {
                const entry = Object.entries(countryCodes).find(
                ([_, name]) => name === countryName
                );
                return entry ? entry[0] : countryName;
            }
            ),
        },
        });
    } catch (error) {
        console.error("Error verifying proof:", error);
        return NextResponse.json(
        {
            status: "error",
            result: false,
            reason: "Internal Error",
            error_code: "INTERNAL_ERROR",
        },
        { status: 200 }
        );
    }
}
