TRACKING_NUMBERS = {
    "61485839092": "freshcarpetdryingmelbourne.com.au",
    "61408842274": "freshwetcarpetmelbourne.com.au",
    "61485839070": "freshwaterdamagemelbourne.com.au",

    "61485839060": "freshcarpetdryingbrisbane.com.au",
    "61488886022": "freshwetcarpetbrisbane.com.au",
    "61485839147": "freshwaterdamagebrisbane.com.au",

    "61485839148": "freshwaterdamagesydney.com.au",
    "61447839299": "freshwetcarpetsydney.com.au",
    "61485839058": "freshcarpetdryingsydney.com.au",

    "61485839135": "freshpestcontrolsydney.com.au",
    "61485839131": "freshpestsolutionssydney.com.au",
    "61488825156": "freshpestssydney.com.au",

    "61485839047": "freshpestcontrolbrisbane.com.au",
    "61485839133": "freshpestsolutionsbrisbane.com.au",
    "61488825166": "freshpestsbrisbane.com.au",

    "61485839076": "freshpestcontrolmelbourne.com.au",
    "61485838983": "freshpestsolutionsmelbourne.com.au",
    "61488825203": "freshpestsmelbourne.com.au",

    "61480099123": "freshpossumremovalbrisbane.com.au",
    "61488825192": "freshpossumremovalsydney.com.au",
    "61488885799": "freshpossumremovalmelbourne.com.au",

    "61488885772": "freshpossummanbrisbane.com.au",
    "61480041176": "freshpossummansydney.com.au",
    "61480041162": "freshpossummanmelbourne.com.au",

    "61488825321": "freshpossumspecialist.com.au",
    "61485839146": "freshpossumspecialistsydney.com.au",
    "61485839063": "freshpossumspecialistmelbourne.com.au",

    "61480059684": "freshdeadanimalremovalbrisbane.com.au",
    "61480064693": "freshdeadanimalspecialistbrisbane.com.au",
    "61485834219": "freshdeadanimalcleanupqld.com.au",

    "61488899230": "freshdeadanimalremovalsydney.com.au",
    "61480013560": "freshdeadanimalspecialistsydney.com.au",
    "61480064694": "freshdeadanimalcleanupnsw.com.au",

    "61485833776": "freshdeadanimalremovalmelbourne.com.au",
    "61480064692": "freshdeadanimalspecialistmelbourne.com.au",
    "61480012485": "freshdeadanimalcleanupvic.com.au",

    "61480058425": "freshcouchcleaningbrisbane.com.au",
    "61488899200": "freshupholsterycleaningbrisbane.com.au",
    "61480060298": "freshsofacleaningbrisbane.com.au",

    "61480059097": "freshcouchcleaningsydney.com.au",
    "61480058435": "freshupholsterycleaningsydney.com.au",
    "61480037771": "freshsofacleaningsydney.com.au",

    "61480061330": "freshcouchcleaningmelbourne.com.au",
    "61480058429": "freshupholsterycleaningmelbourne.com.au",
    "61488898845": "freshsofacleaningmelbourne.com.au",

    "61480829928": "freshcurtaincleaningbrisbane.com.au",
    "61480830255": "freshcurtainsteamcleaningbrisbane.com.au",
    "61480830213": "freshdrapecleaningbrisbane.com.au",

    "61480830090": "freshcurtaincleaningsydney.com.au",
    "61480829895": "freshcurtainsteamcleaningsydney.com.au",
    "61480829936": "freshdrapecleaningsydney.com.au",

    "61480830261": "freshcurtaincleaningmelbourne.com.au",
    "61480829914": "freshcurtainsteamcleaningmelbourne.com.au",
    "61480829939": "freshdrapecleaningmelbourne.com.au",

    "61485962127": "freshtermitesmelbourne.com.au",
    "61485998467": "freshtermiteinspectormelbourne.com.au",
    "61480830254": "freshtermitemanmelbourne.com.au",

    "61468229206": "rodentremovalbrisbane.com.au",
    "61468229324": "cockroachcontrolbrisbane.com.au",

    "61468229412": "rodentremovalsydney.com.au",
    "61468229496": "cockroachremovalsydney.com.au",

    "61468229526": "rodentcontrolmelbourne.com.au",

    "61370646500": "localfloodrestorationbrisbane.com.au",
    "61370646501": "floodrestorationservicesbrisbane.com.au",

    "61370646502": "localfloodrestorationsydney.com.au",
    "61370646503": "samedayfloodrestorationsydney.com.au",

    "61370646504": "floodrestorationexpertsmelbourne.com.au",
    "61370646505": "floodrestorationservicesmelbourne.com.au",

    "61468229587": "antcontrolmelbourne.com.au",
    "61468229585": "cockroachcontrolmelbourne.com.au",
}


def is_valid_tracking_number(
    cld: str | None,
) -> bool:

    if not cld:
        return False

    return cld in TRACKING_NUMBERS


def get_tracking_number_options():

    return [
        {
            "cld": cld,
            "website": website,
        }
        for cld, website
        in TRACKING_NUMBERS.items()
    ]