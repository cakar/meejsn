FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    // stylePanelAspectRatio: 150/100,
    // imageResizeTartgetWidth: 300,
    // imageResizeTartgetHeight: 450
})
FilePond.parse(document.body)