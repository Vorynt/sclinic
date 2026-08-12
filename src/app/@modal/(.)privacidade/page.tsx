import { LegalDocumentBody } from "@/modules/marketing/components/LegalDocumentBody"
import { LegalDocumentModal } from "@/modules/marketing/components/LegalDocumentModal"
import { PRIVACY_POLICY } from "@/modules/marketing/constants/privacy-policy"

export default function InterceptedPrivacyPage() {
  return (
    <LegalDocumentModal
      title={PRIVACY_POLICY.title}
      description={`Última atualização: ${PRIVACY_POLICY.lastUpdated}`}>
      <LegalDocumentBody document={PRIVACY_POLICY} hideTitle />
    </LegalDocumentModal>
  )
}
