- [ ] for missing microbes check again if there is 1:1 matching pciture in /home/markusg/Private/claude-experiments/microbes-overview/ - if yes take photo and try to link to public product page on giantmicrobes.com or riesenmikroben.de (if nmo product page just take domain as link)
- [x] Top Bar Changes 
  - Menu Button (☰) without Label 
  - Title "Microbes Atlas"
  - Remove Subtitle
  - Remove Icon
- [x] Even if thickness sldier is down to 10% ensure we always do have a minumum thickness of 1 point (1px on screen, hairline on print)
- [x] Check that labels in SVG do not overlap (also for translation)
  - https://blurayne.github.io/claude-experiments/microbes-overview/renders/set/epithelial/finals/hepatocyte__textbook.avif
      de: Kernkörperchen vs. Mikrovilli
- [x] Put a button to the end of the menu with to settings dialog with "⤓ Download Application Icon"
- [x] Even if thickness slider is down to 10% ensure we always do have a minumum thickness of 1 point (1px on screen, hairline on print)
- [x] Allow line thickness to go down to 0% — minimums still apply
- [ ] Restructure Menu / New Sections (later)
- [ ] Page Sections
  - [ ] For "Cell Organelles" add a new intro section with "How the cell works"
  - [ ] After "Cell Organelles" add a new section with "Cell types of the Human body" which explains the major categories of cells:
        Primary Tissues & Cell Types
        - Epithelial Cells: Forms protective barriers on inner and outer body surfaces (skin, blood vessels, organs), regulating secretion and absorption.
        - Muscle Cells: Specialized for contraction; divided into skeletal muscles (voluntary), cardiac muscle, and smooth muscles (involuntary in organs).
        - Nerve Cells / Neurons: Responsible for generating, transmitting, and processing electrical and chemical signals throughout the nervous system.
        - Connective Tissue Cells: Includes fibroblasts, cartilage, and bone cells (osteocytes), providing stability, structure, and metabolic exchange.
        - Blood and Immune Cells: Red blood cells (erythrocytes) transport oxygen, while white blood cells (leukocytes) and lymphocytes fight pathogens as part of the immune system.
  - [ ] Always differentiate between audiences and write text accordingly: Kid, Adults, Scientists (put to AGENTS.md)
- [ ] New Section: Function, Control, Characteristics of Skeletal Muscle (Striated Muscle), Cardiac Muscle (Myocardium), Smooth Muscle
- [ ] New Set: Muscle Cells 
	  - [ ] Entry: Type I Fibers (Red Muscle Fibers / "Slow-Twitch") 
	  - [ ] Entry: Type II Fibers (White Muscle Fibers / "Fast-Twitch")
	  - [ ] Type IIa Fibers:
	  - [ ] Type IIx Fibers (formerly often Type IIb):
- [ ] For AGENTS.md when adding a new entry translate to de/en and de for kids do an audition for de/en. try to add GIANT micro and ensure its the right mathc
- [ ] Add entry for chicken pox
- [ ] PDF-Book for Children
  - [ ] link in initial intro section of the page to download or view in browser
  - [ ] Develop a Script to generate
     - Use HTML and print to from chromeless browser to PDF (playwright; python script with uv-shebang)
     - Short Section Title +  Intro go to Normal Entry Pages
     - Longet  Section Title + Intro go + Additional Text Section reserve a new pges
     - 2 Page Layout or Normal Entries
       - Page A
           Title of Entry

           +------+---------------------+
           | REAL | SEM                 |
           +------+---------------------+
           | 3D   | TEXTBOOK /w Labels  | 
           +------+---------------------+

           Description

           (if there is a giant microbe you can put it to description align float:right)

       - Page B 

          Coloring Page is Full Screen if there is any