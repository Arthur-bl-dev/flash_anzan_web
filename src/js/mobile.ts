import {
    AppUpdate,
    AppUpdateAvailability,
    FlexibleUpdateInstallStatus,
    type FlexibleUpdateState,
} from '@capawesome/capacitor-app-update'
import { button, htmlElements } from './dom/htmlElement.js'

const flexibleUpdateInstallStatusMessageMap: { [key in FlexibleUpdateInstallStatus]: string } = {
    [FlexibleUpdateInstallStatus.UNKNOWN]: 'Status desconhecido',
    [FlexibleUpdateInstallStatus.PENDING]: 'Aguardando atualização...',
    [FlexibleUpdateInstallStatus.DOWNLOADING]: 'Preparando a atualização...',
    [FlexibleUpdateInstallStatus.INSTALLING]: 'Instalando a atualização...',
    [FlexibleUpdateInstallStatus.INSTALLED]: 'アップデートをインストールしました。',
    [FlexibleUpdateInstallStatus.FAILED]: 'Atualização instalada',
    [FlexibleUpdateInstallStatus.CANCELED]: 'Atualização cancelada.',
    [FlexibleUpdateInstallStatus.DOWNLOADED]: 'Atualização pronta para ser instalada.',
}

export async function checkMobileAppUpdate(): Promise<void> {
    if (import.meta.env.MODE !== 'mobile') {
        return
    }

    const completeFlexibleUpdate = async (): Promise<void> => {
        await AppUpdate.completeFlexibleUpdate()
    }

    const startFlexibleUpdate = async (): Promise<void> => {
        const result = await AppUpdate.getAppUpdateInfo()
        if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
            return
        }
        if (result.flexibleUpdateAllowed ?? false) {
            AppUpdate.addListener('onFlexibleUpdateStateChange', (state: FlexibleUpdateState) => {
                htmlElements.inAppUpdateNotificationMessage.innerText =
                    flexibleUpdateInstallStatusMessageMap[state.installStatus]
                switch (state.installStatus) {
                    case FlexibleUpdateInstallStatus.DOWNLOADED:
                        button.completeFlexibleUpdate.addEventListener('click', () => {
                            void completeFlexibleUpdate()
                        })
                        button.completeFlexibleUpdate.classList.remove('d-none')
                        break
                    case FlexibleUpdateInstallStatus.DOWNLOADING: {
                        // ensured to be number because install status is DOWNLOADING
                        const totalBytesToDownload = state.totalBytesToDownload as number
                        const bytesDownloaded = state.bytesDownloaded as number
                        const totalBytesToDownloadMb = Math.floor(totalBytesToDownload / 10000) / 100
                        const downloadedPercentage = Math.floor((bytesDownloaded * 100) / totalBytesToDownload)
                        htmlElements.inAppUpdateNotificationMessage.innerText += ` (${totalBytesToDownloadMb} MB de ${downloadedPercentage}%)`

                        break
                    }
                    default:
                }
            })
            await AppUpdate.startFlexibleUpdate()
            htmlElements.inAppUpdateNotification.classList.remove('d-none')
        }
    }

    await startFlexibleUpdate()
}
