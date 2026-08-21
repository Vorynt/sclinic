/**
 * Provider-agnostic postal address lookup contract.
 * Swap the concrete provider in `./index.ts` only.
 */

export type PostalAddress = {
  zip: string
  street: string
  neighborhood: string | null
  city: string
  state: string
}

export type AddressLookupProvider = {
  lookupByZip(zip: string): Promise<PostalAddress>
}
