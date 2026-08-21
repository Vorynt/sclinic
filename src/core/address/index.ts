import { ViaCepAddressLookupProvider } from "@/core/address/providers/viacep"
import type { AddressLookupProvider } from "@/core/address/types"

/**
 * Single place to swap the address lookup provider.
 * Callers always use `address.lookupByZip` — never import ViaCEP directly.
 */
function createAddressLookupProvider(): AddressLookupProvider {
  return new ViaCepAddressLookupProvider()
  // Example when swapping later:
  // return new BrasilApiAddressLookupProvider()
}

let provider: AddressLookupProvider | null = null

function getProvider(): AddressLookupProvider {
  if (!provider) {
    provider = createAddressLookupProvider()
  }
  return provider
}

export const address = {
  lookupByZip(zip: string) {
    return getProvider().lookupByZip(zip)
  },
}

export type { AddressLookupProvider, PostalAddress } from "@/core/address/types"
