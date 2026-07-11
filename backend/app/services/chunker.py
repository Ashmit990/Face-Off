import re

# Common CV section headers to detect (case-insensitive)
SECTION_HEADERS = [
    "professional summary", "summary", "objective",
    "work experience", "experience", "employment history",
    "projects", "personal projects",
    "skills", "technical skills",
    "education",
    "achievements", "awards", "certifications",
    "internships",
]

def chunk_cv_text(raw_text: str) -> list[dict]:
    """
    Splits raw CV text into semantic chunks based on common section headers.
    Returns list of {"section": str, "text": str}.
    """
    lines = raw_text.split("\n")
    chunks = []
    current_section = "general"
    current_lines = []

    def is_header(line: str) -> str | None:
        clean = line.strip().lower().rstrip(":")
        for header in SECTION_HEADERS:
            if clean == header:
                return header
        return None

    for line in lines:
        header = is_header(line)
        if header:
            # Save previous section before starting new one
            if current_lines:
                text = "\n".join(current_lines).strip()
                if text:
                    chunks.append({"section": current_section, "text": text})
            current_section = header
            current_lines = []
        else:
            current_lines.append(line)

    # Save the last section
    if current_lines:
        text = "\n".join(current_lines).strip()
        if text:
            chunks.append({"section": current_section, "text": text})

    return chunks