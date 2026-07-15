import AudioBlock from '@/components/AudioBlock.vue'
import VideoBlock from '@/components/VideoBlock.vue'
import UploadPlugin from '@/components/UploadPlugin.vue'
import { h, createApp } from 'vue'
import { Upload as UploadIcon } from 'lucide-vue-next'
import { createDialog } from '@/utils/dialogs'
import translationPlugin from '../translation'

export class Upload {
	constructor({ data, api, readOnly }) {
		this.data = data
		this.readOnly = readOnly
	}

	static get toolbox() {
		const app = createApp({
			render: () =>
				h(UploadIcon, { size: 18, strokeWidth: 1.5, color: 'black' }),
		})

		const div = document.createElement('div')
		app.mount(div)

		return {
			title: 'Upload',
			icon: div.innerHTML,
		}
	}

	static get isReadOnlySupported() {
		return true
	}

	render() {
		this.wrapper = document.createElement('div')

		if (this.data && this.data.file_url) {
			this.renderFile(this.data)
		} else {
			this.renderFileUploader()
		}

		return this.wrapper
	}

	renderFile(file) {
		if (this.isVideo(file.file_type)) {
			const app = createApp(VideoBlock, {
				file: file.file_url,
				readOnly: this.readOnly,
				quizzes: file.quizzes || [],
				saveQuizzes: (quizzes) => {
					if (this.readOnly) return
					this.data.quizzes = quizzes
				},
			})
			app.use(translationPlugin)
			app.config.globalProperties.$dialog = createDialog
			app.mount(this.wrapper)
			return
		} else if (this.isAudio(file.file_type)) {
			const app = createApp(AudioBlock, {
				file: file.file_url,
			})
			app.mount(this.wrapper)
			return
		} else if (this.isPDF(file.file_type)) {
			this.wrapper.innerHTML = `<iframe src="${
				window.location.origin
			}${encodeURI(
				file.file_url
			)}" width='100%' height='700px' class="mb-4" type="application/pdf"></iframe>`
			return
		} else if (this.isImage(file.file_type)) {
			this.wrapper.innerHTML = `<img class="mb-4" src=${encodeURI(
				file.file_url
			)} width='100%'>`
			return
		} else {
			const fileName = file.file_name || file.file_url.split('/').pop()
			const ext = (file.file_type || '').toLowerCase()
			this.wrapper.innerHTML = `<div class="mb-4 flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
				<div class="flex flex-col">
					<span class="font-medium text-sm">${fileName}</span>
					${ext ? `<span class="text-xs text-gray-500 uppercase">${ext}</span>` : ''}
				</div>
				<a href="${window.location.origin}${encodeURI(file.file_url)}" download="${fileName}" class="ml-auto text-sm text-blue-600 hover:underline">Download</a>
			</div>`
			return
		}
	}

	renderFileUploader() {
		const app = createApp(UploadPlugin, {
			onFileUploaded: (file) => {
				this.data.file_url = file.file_url
				this.data.file_name = file.file_name
				this.data.file_type = file.file_type
				this.renderFile(file)
			},
		})
		app.use(translationPlugin)
		app.mount(this.wrapper)
	}

	validate(savedData) {
		if (!savedData.file_url || !savedData.file_type) {
			return false
		}
		return true
	}

	save(blockContent) {
		return {
			file_url: this.data.file_url,
			file_name: this.data.file_name,
			file_type: this.data.file_type,
			quizzes: this.data.quizzes || [],
		}
	}

	isVideo(type) {
		if (!type) return false
		return ['mov', 'mp4', 'avi', 'mkv', 'webm'].includes(type.toLowerCase())
	}

	isAudio(type) {
		if (!type) return false
		return ['mp3', 'wav', 'ogg'].includes(type.toLowerCase())
	}

	isPDF(type) {
		if (!type) return false
		return type.toLowerCase() === 'pdf'
	}

	isImage(type) {
		if (!type) return false
		return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(type.toLowerCase())
	}
}
