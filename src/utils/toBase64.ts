import fs from 'fs'

interface ToBase64Params {
	file_path: string
	mime_type: string
}

export const toBase64 = ({ file_path, mime_type }: ToBase64Params) => {
	const fileContent = fs.readFileSync(file_path)
	const base64Data = fileContent.toString('base64')

	return `data:${mime_type};base64,${base64Data}`
}
