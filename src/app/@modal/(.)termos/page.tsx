import { LegalDocumentBody } from "@/modules/marketing/components/LegalDocumentBody"
import { LegalDocumentModal } from "@/modules/marketing/components/LegalDocumentModal"
import { TERMS_OF_USE } from "@/modules/marketing/constants/terms-of-use"

export default function InterceptedTermsPage() {
  return (
    <LegalDocumentModal
      title={TERMS_OF_USE.title}
      description={`Última atualização: ${TERMS_OF_USE.lastUpdated}`}>
      <LegalDocumentBody document={TERMS_OF_USE} hideTitle />
    </LegalDocumentModal>
  )
}
