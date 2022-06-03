FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    stylePanelAspectRatio: 150/100,
    imageResizeTartgetWidth: 100,
    imageResizeTartgetHeight: 150
})
FilePond.parse(document.body)