export type ApiResponse<T> = {
  data: T
  success: true
} | {
  error: string
  success: false
}
