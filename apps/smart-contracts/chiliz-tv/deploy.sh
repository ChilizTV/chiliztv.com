#!/bin/bash
#
# ChilizTV Deployment Script (Chiliz-only)
#
# All configuration is loaded from .env (see .env.example).
#
# Usage:
#   ./deploy.sh --network chilizTestnet --all     # full platform (PariMatchFactory + StreamWalletFactory + ChilizSwapRouter, fully wired)
#   ./deploy.sh --network chilizTestnet --pari    # PariMatchFactory + router + sample match (no streaming)
#   ./deploy.sh --network chilizTestnet --stream  # StreamWalletFactory only
#   ./deploy.sh --network chilizTestnet --swap          # ChilizSwapRouter only (wire it post-deploy)
#   ./deploy.sh --network chilizTestnet --redeploy-swap      # ChilizSwapRouter redeploy + auto-wire to existing factories
#   ./deploy.sh --network chilizTestnet --upgrade-leaderboard # LeaderboardRewards V2 (UUPS upgradeToAndCall + initializeV2)
#   ./deploy.sh --network chilizMainnet  --all
#
# Add `--dry-run` to simulate via forge without broadcasting — no on-chain tx,
# no deployments/<network>.json update. Useful to preview gas + address layout.
#
# Set TRANSFER_OWNERSHIP=true in your env file to transfer Ownable.owner of
# the deployed factories + router to SAFE_ADDRESS at the end of the run.
# Defaults to false so testnet iteration keeps the deployer EOA as owner.
#
# The --network flag is a safety label only: it picks the mainnet warning
# and is used for output paths (deployments/<network>.json). The actual
# RPC_URL / CHAIN_ID / FORGE_FLAGS come from .env.
#
# NOTE: The legacy LiquidityPool + BettingMatchFactory stack is gone. The
# --match and --pool flags were removed alongside the contract deletions.
# Use --all (or --pari for pari-only) to deploy the new pari-mutuel system.
#

set -e

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Parse arguments ──────────────────────────────────────────────────────────
NETWORK=""
DEPLOY_TYPE=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --network)
            NETWORK="$2"; shift 2 ;;
        --all)
            DEPLOY_TYPE="all"; shift ;;
        --pari)
            DEPLOY_TYPE="pari"; shift ;;
        --stream)
            DEPLOY_TYPE="stream"; shift ;;
        --swap)
            DEPLOY_TYPE="swap"; shift ;;
        --redeploy-swap)
            DEPLOY_TYPE="redeploy-swap"; shift ;;
        --upgrade-leaderboard)
            DEPLOY_TYPE="upgrade-leaderboard"; shift ;;
        --dry-run)
            DRY_RUN=true; shift ;;
        --match|--pool)
            echo -e "${RED}'$1' is no longer supported (LiquidityPool + BettingMatchFactory were removed).${NC}"
            echo -e "${RED}  Use --all for the full pari-mutuel platform, or --pari for pari-only.${NC}"
            exit 1 ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            echo "Usage: ./deploy.sh --network <chilizTestnet|chilizMainnet> <--all|--pari|--stream|--swap|--redeploy-swap|--upgrade-leaderboard> [--dry-run]"
            exit 1 ;;
    esac
done

if [ -z "$NETWORK" ] || [ -z "$DEPLOY_TYPE" ]; then
    echo -e "${RED}Missing required arguments.${NC}"
    echo "Usage: ./deploy.sh --network <chilizTestnet|chilizMainnet> <--all|--pari|--stream|--swap|--redeploy-swap|--upgrade-leaderboard> [--dry-run]"
    exit 1
fi

# ── Load .env ────────────────────────────────────────────────────────────────
# Prefer .env.<network> when present, otherwise .env.
ENV_FILE=".env"
if [ -f ".env.${NETWORK}" ]; then
    ENV_FILE=".env.${NETWORK}"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found.${NC}"
    echo "Copy .env.example to .env and fill in values."
    exit 1
fi

# set -a exports every variable assigned until `set +a`.
# sed strips a leading UTF-8 BOM and any trailing CR — Windows editors
# routinely add both, which would otherwise break `source`.
set -a
# shellcheck disable=SC1090
source <(sed -e '1s/^\xEF\xBB\xBF//' -e 's/\r$//' "$ENV_FILE")
set +a

# ── Validate required env vars ───────────────────────────────────────────────
REQUIRED="PRIVATE_KEY SAFE_ADDRESS RPC_URL CHAIN_ID"
MISSING=""
for VAR in $REQUIRED; do
    if [ -z "${!VAR}" ]; then
        MISSING="${MISSING}\n  - $VAR"
    fi
done
if [ -n "$MISSING" ]; then
    echo -e "${RED}Missing required env vars in $ENV_FILE:${MISSING}${NC}"
    exit 1
fi

# ── Sanity check: CHAIN_ID matches --network label ───────────────────────────
case "$NETWORK" in
    chilizTestnet)
        EXPECTED_CHAIN_ID=88882 ;;
    chilizMainnet)
        EXPECTED_CHAIN_ID=88888 ;;
    *)
        echo -e "${YELLOW}Warning: unknown --network '$NETWORK' (skipping chain-id sanity check)${NC}"
        EXPECTED_CHAIN_ID="" ;;
esac
if [ -n "$EXPECTED_CHAIN_ID" ] && [ "$CHAIN_ID" != "$EXPECTED_CHAIN_ID" ]; then
    echo -e "${RED}Chain id mismatch:${NC}"
    echo -e "  --network $NETWORK expects CHAIN_ID=$EXPECTED_CHAIN_ID"
    echo -e "  but $ENV_FILE has CHAIN_ID=$CHAIN_ID"
    echo -e "  Fix $ENV_FILE or pass the correct --network."
    exit 1
fi

# ── Deploy type → script mapping ─────────────────────────────────────────────
REQUIRES_KAYEN=false
REQUIRES_USDC=false
REQUIRES_FACTORIES=false
REQUIRES_LEADERBOARD_PROXY=false
case "$DEPLOY_TYPE" in
    all)
        SCRIPT="script/DeployAll.s.sol"
        REQUIRES_KAYEN=true
        REQUIRES_USDC=true ;;
    pari)
        SCRIPT="script/DeployPari.s.sol"
        REQUIRES_KAYEN=true
        REQUIRES_USDC=true ;;
    stream)
        SCRIPT="script/DeployStreaming.s.sol"
        REQUIRES_KAYEN=true
        REQUIRES_USDC=true ;;
    swap)
        SCRIPT="script/DeploySwap.s.sol"
        REQUIRES_KAYEN=true
        REQUIRES_USDC=true ;;
    redeploy-swap)
        SCRIPT="script/RedeploySwapRouter.s.sol"
        REQUIRES_KAYEN=true
        REQUIRES_USDC=true
        REQUIRES_FACTORIES=true ;;
    upgrade-leaderboard)
        SCRIPT="script/UpgradeLeaderboard.s.sol"
        REQUIRES_LEADERBOARD_PROXY=true ;;
esac

# ── USDC / Kayen validation ──────────────────────────────────────────────────
if [ "$REQUIRES_USDC" = true ] && [ -z "$USDC_ADDRESS" ]; then
    echo -e "${RED}Missing USDC_ADDRESS in $ENV_FILE${NC}"
    exit 1
fi

if [ "$REQUIRES_KAYEN" = true ]; then
    echo -e "${CYAN}Resolving Kayen DEX addresses...${NC}"
    MISSING=""
    [ -z "$KAYEN_MASTER_ROUTER" ] && MISSING="${MISSING}\n  - KAYEN_MASTER_ROUTER"
    [ -z "$KAYEN_ROUTER" ]        && MISSING="${MISSING}\n  - KAYEN_ROUTER"
    [ -z "$WCHZ_ADDRESS" ]        && MISSING="${MISSING}\n  - WCHZ_ADDRESS"
    if [ -n "$MISSING" ]; then
        echo -e "${RED}Missing in $ENV_FILE:${MISSING}${NC}"
        exit 1
    fi
    if [ "${KAYEN_MASTER_ROUTER,,}" = "${KAYEN_ROUTER,,}" ]; then
        echo -e "${YELLOW}WARNING: KAYEN_MASTER_ROUTER == KAYEN_ROUTER.${NC}"
        echo -e "${YELLOW}  Master Router V2 (CHZ-native, Kayen-specific signature) and the basic"
        echo -e "${YELLOW}  Kayen Router (Uniswap V2 fork, standard signature) are documented as"
        echo -e "${YELLOW}  distinct contracts. On Spicy testnet only one usable address exists, so"
        echo -e "${YELLOW}  pinning both to the same router is intentional. On mainnet they MUST be"
        echo -e "${YELLOW}  distinct -- double-check before broadcasting."
        echo -e "${YELLOW}  Docs: https://kayen-protocol.gitbook.io/documentation/references/contracts${NC}"
    fi
    echo -e "  KAYEN_MASTER_ROUTER: ${YELLOW}$KAYEN_MASTER_ROUTER${NC}"
    echo -e "  KAYEN_ROUTER:        ${YELLOW}$KAYEN_ROUTER${NC}"
    echo -e "  WCHZ_ADDRESS:        ${YELLOW}$WCHZ_ADDRESS${NC}"
    echo -e "  USDC_ADDRESS:        ${YELLOW}$USDC_ADDRESS${NC}"
    echo ""
fi

# ── Leaderboard proxy validation (upgrade-leaderboard targets existing proxy) ─
if [ "$REQUIRES_LEADERBOARD_PROXY" = true ]; then
    if [ -z "$LEADERBOARD_PROXY" ]; then
        echo -e "${RED}Missing in $ENV_FILE for --upgrade-leaderboard:${NC}"
        echo -e "${RED}  - LEADERBOARD_PROXY${NC}"
        echo -e "${YELLOW}  Must be the ERC1967 proxy address (NOT the implementation).${NC}"
        echo -e "${YELLOW}  See deployments/${NETWORK}.json - ERC1967Proxy entry.${NC}"
        exit 1
    fi
    echo -e "${CYAN}Upgrading leaderboard proxy...${NC}"
    echo -e "  LEADERBOARD_PROXY: ${YELLOW}$LEADERBOARD_PROXY${NC}"
    echo ""
fi

# ── Existing-factory validation (redeploy-swap rewires existing factories) ───
if [ "$REQUIRES_FACTORIES" = true ]; then
    MISSING=""
    [ -z "$PARI_FACTORY_ADDRESS" ]   && MISSING="${MISSING}\n  - PARI_FACTORY_ADDRESS"
    [ -z "$STREAM_FACTORY_ADDRESS" ] && MISSING="${MISSING}\n  - STREAM_FACTORY_ADDRESS"
    if [ -n "$MISSING" ]; then
        echo -e "${RED}Missing in $ENV_FILE for --redeploy-swap:${MISSING}${NC}"
        echo -e "${YELLOW}  These must point at the EXISTING factories you want to rewire.${NC}"
        echo -e "${YELLOW}  See deployments/${NETWORK}.json - PariMatchFactory + StreamWalletFactory.${NC}"
        exit 1
    fi
    echo -e "${CYAN}Rewiring existing factories...${NC}"
    echo -e "  PARI_FACTORY_ADDRESS:   ${YELLOW}$PARI_FACTORY_ADDRESS${NC}"
    echo -e "  STREAM_FACTORY_ADDRESS: ${YELLOW}$STREAM_FACTORY_ADDRESS${NC}"
    echo ""
fi

# ── Gas-price floor check ────────────────────────────────────────────────────
# Chiliz mainnet's `eth_gasPrice` is ~2,500 gwei (matches block baseFeePerGas)
# and replace-by-fee requires a bump above the floor. Broadcasting below the
# floor produces a tx that sits in the mempool forever and locks the nonce
# until cancelled. Parse --with-gas-price out of FORGE_FLAGS, query the live
# floor, and abort if we'd ship underpriced.
GAS_PRICE_OVERRIDE=$(echo "$FORGE_FLAGS" | grep -oE -- '--with-gas-price[= ]+[0-9]+' | grep -oE '[0-9]+$' || true)
if [ -n "$GAS_PRICE_OVERRIDE" ] && command -v curl &> /dev/null; then
    NETWORK_GAS_HEX=$(curl -fsS -X POST "$RPC_URL" \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","id":1,"method":"eth_gasPrice","params":[]}' \
        2>/dev/null | sed -nE 's/.*"result":"(0x[0-9a-fA-F]+)".*/\1/p')
    if [ -n "$NETWORK_GAS_HEX" ]; then
        NETWORK_GAS=$((NETWORK_GAS_HEX))
        if [ "$GAS_PRICE_OVERRIDE" -lt "$NETWORK_GAS" ]; then
            CFG_GWEI=$((GAS_PRICE_OVERRIDE / 1000000000))
            NET_GWEI=$((NETWORK_GAS / 1000000000))
            echo -e "${RED}╔══════════════════════════════════════════════╗${NC}"
            echo -e "${RED}║          ⚠  GAS PRICE TOO LOW  ⚠            ║${NC}"
            echo -e "${RED}╚══════════════════════════════════════════════╝${NC}"
            echo -e "${RED}FORGE_FLAGS --with-gas-price: ${CFG_GWEI} gwei${NC}"
            echo -e "${RED}Network eth_gasPrice:         ${NET_GWEI} gwei${NC}"
            echo -e "${YELLOW}Broadcasting underpriced would leave the first tx pending forever${NC}"
            echo -e "${YELLOW}and lock nonce $(printf '%s' "$ADMIN_ADDRESS")'s sequence until cancelled.${NC}"
            echo -e "${YELLOW}Bump --with-gas-price above ${NET_GWEI} gwei in $ENV_FILE.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Warning: could not fetch eth_gasPrice from $RPC_URL — skipping gas-price floor check.${NC}"
    fi
fi

# ── Mainnet safety warning ───────────────────────────────────────────────────
if [ "$NETWORK" = "chilizMainnet" ]; then
    echo -e "${RED}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║        ⚠  MAINNET DEPLOYMENT WARNING  ⚠     ║${NC}"
    echo -e "${RED}║  Real funds are at risk. Double-check:       ║${NC}"
    echo -e "${RED}║  - All contract addresses are correct        ║${NC}"
    echo -e "${RED}║  - Ownership will transfer to Safe multisig  ║${NC}"
    echo -e "${RED}║  - Contracts are tested on testnet first     ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════╝${NC}"
    echo ""
fi

# ── Display summary ──────────────────────────────────────────────────────────
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ChilizTV Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Network:      ${YELLOW}$NETWORK${NC} (Chain ID: $CHAIN_ID)"
echo -e "Deploy Type:  ${YELLOW}$DEPLOY_TYPE${NC}"
[ "$DRY_RUN" = true ] && echo -e "Mode:         ${YELLOW}DRY-RUN (no --broadcast)${NC}"
echo -e "Script:       ${YELLOW}$SCRIPT${NC}"
echo -e "RPC URL:      ${YELLOW}$RPC_URL${NC}"
echo -e "Safe Address: ${YELLOW}$SAFE_ADDRESS${NC}"
echo -e "Env File:     ${YELLOW}$ENV_FILE${NC}"
[ -n "$FORGE_FLAGS" ] && echo -e "Forge Flags:  ${YELLOW}$FORGE_FLAGS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ── Confirm ──────────────────────────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}Dry-run mode: skipping confirmation prompt (no broadcast will happen).${NC}"
else
    read -p "Deploy to $NETWORK? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 0
    fi
fi

echo ""
if [ "$DRY_RUN" = true ]; then
    echo -e "${GREEN}Starting forge simulation (dry-run)...${NC}"
else
    echo -e "${GREEN}Starting deployment...${NC}"
fi
echo ""

# ── Prepare output directory ─────────────────────────────────────────────────
DEPLOY_OUT="deployments/${NETWORK}.json"
mkdir -p deployments

# ── Run forge script ─────────────────────────────────────────────────────────
# NOTE: --chain-id intentionally omitted. Forge's NamedChain registry rejects
# Chiliz IDs (88882 / 88888) with "Chain not supported". RPC URL is enough
# to detect the chain, and --legacy signing does not require chain id.
# In --dry-run mode we drop --broadcast; forge runs the script locally
# against a fork of $RPC_URL, simulating every tx without emitting one.
if [ "$DRY_RUN" = true ]; then
    BROADCAST_FLAG=""
else
    BROADCAST_FLAG="--broadcast"
fi
FORGE_CMD="forge script $SCRIPT \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    $BROADCAST_FLAG \
    --slow \
    $FORGE_FLAGS \
    -vvvv"

echo -e "${CYAN}$FORGE_CMD${NC}"
echo ""
eval $FORGE_CMD

# In dry-run we never wrote a broadcast file, so skip the address extraction
# and post-deploy guidance — there is nothing to record or follow up on.
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${GREEN}Dry-run complete. No on-chain transactions were sent.${NC}"
    echo -e "${YELLOW}Re-run without --dry-run to actually deploy.${NC}"
    exit 0
fi

# ── Extract deployed addresses from broadcast ────────────────────────────────
BROADCAST_DIR="broadcast/$(basename $SCRIPT)/${CHAIN_ID}"
LATEST_RUN="${BROADCAST_DIR}/run-latest.json"

if [ -f "$LATEST_RUN" ] && command -v jq &> /dev/null; then
    echo ""
    echo -e "${GREEN}Extracting deployed addresses...${NC}"
    jq '{
        network: "'$NETWORK'",
        chainId: '$CHAIN_ID',
        timestamp: (now | todate),
        contracts: [
            .transactions[]
            | select(.transactionType == "CREATE")
            | {
                name: .contractName,
                address: .contractAddress
            }
        ]
    }' "$LATEST_RUN" > "$DEPLOY_OUT"
    echo -e "Saved to: ${YELLOW}$DEPLOY_OUT${NC}"
    echo ""
    jq '.' "$DEPLOY_OUT"
else
    echo -e "${YELLOW}Note: could not extract addresses automatically.${NC}"
    echo "Broadcast file: $LATEST_RUN"
    echo "Check forge output above for deployed addresses."
fi

# ── Post-deployment output ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check deployed addresses in $DEPLOY_OUT"
echo "2. Verify ownership transferred to Safe"
echo "3. Verify contracts: $EXPLORER_URL"
echo ""

if [ "$DEPLOY_TYPE" = "swap" ]; then
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo -e "${YELLOW}Swap Router Post-Deployment Steps:${NC}"
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo ""
    echo "DeploySwap only deploys the router; you still need to wire it. Run as"
    echo "the owner of the factories + router, in this order:"
    echo ""
    echo "  1) pariFactory.setWiring(USDC, FEE_RECIP, NEW_ROUTER)"
    echo -e "     ${CYAN}cast send <PARI_FACTORY> 'setWiring(address,address,address)' \\${NC}"
    echo -e "     ${CYAN}  $USDC_ADDRESS <FEE_RECIP> <NEW_ROUTER> \\${NC}"
    echo -e "     ${CYAN}  --rpc-url $RPC_URL --private-key \$PRIVATE_KEY${NC}"
    echo ""
    echo "  2) newRouter.setMatchFactory(PARI_FACTORY)"
    echo -e "     ${CYAN}cast send <NEW_ROUTER> 'setMatchFactory(address)' \\${NC}"
    echo -e "     ${CYAN}  <PARI_FACTORY> --rpc-url $RPC_URL --private-key \$PRIVATE_KEY${NC}"
    echo ""
    echo "  3) streamFactory.setSwapRouter(NEW_ROUTER)   # only if streaming is wired"
    echo "  4) newRouter.setStreamWalletFactory(STREAM_FACTORY)   # back-pointer check"
    echo ""
    echo "Future matches created by the factory after step 1 automatically receive"
    echo "SWAP_ROUTER_ROLE on the new router -- no manual cast required."
    echo ""
    echo "EXISTING matches (deployed against a previous router) still hold"
    echo "SWAP_ROUTER_ROLE for the OLD router. Their owners must run:"
    echo -e "     ${CYAN}cast send <MATCH> 'revokeRole(bytes32,address)' \$(cast keccak 'SWAP_ROUTER_ROLE') <OLD_ROUTER>${NC}"
    echo -e "     ${CYAN}cast send <MATCH> 'grantRole(bytes32,address)'  \$(cast keccak 'SWAP_ROUTER_ROLE') <NEW_ROUTER>${NC}"
    echo ""
    echo "RedeploySwapRouter.s.sol prints the per-match commands automatically."
    echo ""
fi

if [ "$DEPLOY_TYPE" = "upgrade-leaderboard" ]; then
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo -e "${YELLOW}Leaderboard V2 - Post-Upgrade Steps:${NC}"
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo ""
    echo "The proxy now points at the V2 implementation and initializeV2()"
    echo "has been called (epochDuration = 30 days, epochStartTime = upgrade tx ts)."
    echo ""
    echo "The proxy address is UNCHANGED. The implementation address is new."
    echo "If your deployments JSON tracks the impl separately, update it from"
    echo "the forge log above."
    echo ""
    echo "Remaining manual steps:"
    echo "  1. Verify on-chain views:"
    echo "       cast call \$LEADERBOARD_PROXY 'currentEpoch()(uint256)' --rpc-url \$RPC_URL"
    echo "       cast call \$LEADERBOARD_PROXY 'epochDuration()(uint64)' --rpc-url \$RPC_URL"
    echo "  2. Restart backend so LeaderboardIndexer picks up the new event shapes"
    echo "     (WinRecorded gained an epochId topic; EpochClosed renamed to EpochAdvanced)."
    echo "  3. Frontend ABIs were regenerated as part of this change set; ensure"
    echo "     the new generated.ts is deployed alongside any production rollout."
    echo ""
fi

if [ "$DEPLOY_TYPE" = "redeploy-swap" ]; then
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo -e "${YELLOW}Router Redeploy - Post-Deployment Steps:${NC}"
    echo -e "${YELLOW}────────────────────────────────────────${NC}"
    echo ""
    echo "RedeploySwapRouter already wired pariFactory.setWiring,"
    echo "newRouter.setMatchFactory, streamFactory.setSwapRouter, and"
    echo "newRouter.setStreamWalletFactory. The forge log above contains"
    echo "the per-match revoke/grant cast commands for every existing match."
    echo ""
    echo "Remaining manual steps:"
    echo "  1. Match admin (SAFE_ADDRESS) runs the printed cast commands"
    echo "     per match to rotate SWAP_ROUTER_ROLE from OLD to NEW router."
    echo "  2. Update env files with the new ChilizSwapRouter address:"
    echo "       apps/frontend/.env       NEXT_PUBLIC_CHILIZ_SWAP_ROUTER_ADDRESS"
    echo "       apps/frontend/.env.example  (same key)"
    echo "       apps/backend/.env        CHILIZ_SWAP_ROUTER_ADDRESS"
    echo "       apps/backend/.env.example   (same key)"
    echo "  3. The ChilizSwapRouter entry in $DEPLOY_OUT is the new address."
    echo "  4. Restart backend so ChilizSwapRouterIndexer re-targets the new addr."
    echo ""
    echo "Known limitation: existing StreamWallets cache the OLD router in their"
    echo "per-wallet swapRouter storage. Donations/subs to those streamers via"
    echo "the new router will revert. New wallets (lazy-deployed by the new"
    echo "router on first donate/sub) get the new router automatically."
    echo ""
fi
