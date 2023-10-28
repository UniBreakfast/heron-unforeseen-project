const lsKeyPrefix = 'pacer-'
const prepareKit = {
  'units': prepareUnitsScreen,
  'add-unit': prepareAddUnitScreen,
  'add-act-type': prepareAddActTypeScreen,
  // 'add-activity': prepareAddActivityScreen,
  // 'init-eval': prepareInitEvalScreen,
}

let lastId
let confidence

let units = []

addCenterScrSelect()

loadLastId()
loadConfidence()
loadUnits()

goToScreen('init-eval')
goToScreen('add-activity')
goToScreen('add-unit')
goToScreen('add-act-type')
goToScreen('units')

scrSelectTop.onchange = handleSelectScr
scrSelectCenter.onchange = handleSelectScr

evalForm.onsubmit = handleSubmitInitEval
addUnitForm.onsubmit = handleSubmitAddUnit

addUnitBtn.onclick = () => goToScreen('add-unit')
addUnitBtn2.onclick = () => goToScreen('add-unit')
addUnitBtn3.onclick = () => goToScreen('add-unit')
removeUnitsBtn.onclick = handleRemoveUnits
addActivityBtn.onclick = () => goToScreen('add-activity')

unitsSelect.onchange = updateAddActTypeButtons

function addCenterScrSelect() {
  const scrSelectCenter = scrSelectTop.cloneNode(true)

  scrSelectCenter.id = 'scrSelectCenter'

  scrSelectTop.after(scrSelectCenter)
}

function handleSubmitInitEval() {
  confidence = +evalForm.confidence.value

  saveConfidence()
}

function handleSubmitAddUnit() {
  const data = new FormData(addUnitForm)
  const unit = Object.fromEntries(data)
  const steps = []

  for (const option of addUnitForm.steps.selectedOptions) {
    steps.push(option.value)
  }

  unit.steps = steps

  addUnit(unit)
  addUnitForm.reset()

  goToScreen('units')
}

function handleRemoveUnits() {
  const selectedOptions = unitsSelect.selectedOptions

  for (const option of selectedOptions) {
    const unitId = option.value

    units = units.filter(unit => unit.id != unitId)
    
    unitsSelect.remove(option)
  }

  saveUnits()

  if (!units.length) {
    noUnitsSection.hidden = false
    unitsSection.hidden = true
  }

  updateAddActTypeButtons()
}

function updateAddActTypeButtons() {
  const someUnitsAreSelected = Boolean(unitsSelect.selectedOptions.length)
  const firstSelectedOptionIndex = unitsSelect.selectedOptions[0]?.index
  const lastSelectedOptionIndex = unitsSelect.selectedOptions[unitsSelect.selectedOptions.length - 1]?.index
  const selectedOptionsCanMoveUp = Array.from(unitsSelect.options).some((option, index) => !option.selected && index < lastSelectedOptionIndex)
  const selectedOptionsCanMoveDown = Array.from(unitsSelect.options).some((option, index) => !option.selected && index > firstSelectedOptionIndex)

  unitDetailsBtn.disabled = !someUnitsAreSelected
  editUnitBtn.disabled = !someUnitsAreSelected
  removeUnitsBtn.disabled = !someUnitsAreSelected
  moveUnitUpBtn.disabled = !someUnitsAreSelected || !selectedOptionsCanMoveUp
  moveUnitDownBtn.disabled = !someUnitsAreSelected || !selectedOptionsCanMoveDown
}

function getId() {
  const id = ++lastId

  saveLastId()

  return id
}

function loadLastId() {
  lastId = +localStorage.getItem(lsKeyPrefix + 'lastId') || 1
}

function saveLastId() {
  localStorage.setItem(lsKeyPrefix + 'lastId', lastId)
}

function addUnit(unit) {
  unit = { id: getId(), ...unit }
  units.push(unit)
  saveUnits()
}

function loadUnits() {
  units = JSON.parse(localStorage.getItem(lsKeyPrefix + 'units')) || []
}

function saveUnits() {
  localStorage.setItem(lsKeyPrefix + 'units', JSON.stringify(units))
}

function handleSelectScr(e) {
  goToScreen(e.target.value)
}

function goToScreen(scrName) {
  scrSelectTop.value = scrName
  scrSelectCenter.value = scrName

  const currentScreen = screenContainer.querySelector('.screen:not([hidden])')
  const nextScreen = screenContainer.querySelector(`[data-scr="${scrName}"]`)

  currentScreen?.toggleAttribute('hidden')
  nextScreen?.removeAttribute('hidden')

  nextScreen?.firstElementChild.append(scrSelectCenter)

  prepareKit[scrName]?.()
}

function saveConfidence() {
  localStorage.setItem(lsKeyPrefix + 'confidence', confidence)
}

function loadConfidence() {
  confidence = +localStorage.getItem(lsKeyPrefix + 'confidence') || undefined
}

function prepareUnitsScreen() {
  if (units.length) {
    unitsSelect.innerHTML = units.map(unit => `<option value="${unit.id}">${unit.name}</option>`).join('')

    unitsSection.hidden = false
    noUnitsSection.hidden = true
  } else {
    unitsSection.hidden = true
    noUnitsSection.hidden = false
  }
}

function prepareAddUnitScreen() {
  addUnitForm.reset()
}

function prepareAddActTypeScreen() {
  if (units.length) {
    addActTypeForm.units.innerHTML = units.map(unit => `<option value="${unit.id}">${unit.name}</option>`).join('')

    addActType.hidden = false
    noUnitsNoActsSection.hidden = true

    addActTypeForm.reset()
  } else {
    addActType.hidden = true
    noUnitsNoActsSection.hidden = false
  }

  updateAddActTypeButtons()
}
