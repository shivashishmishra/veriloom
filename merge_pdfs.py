import sys
from pypdf import PdfWriter, PdfReader

def merge_documents(pdf1_path, pdf2_path, output_path):
    writer = PdfWriter()
    print(f"Reading {pdf1_path}...")
    r1 = PdfReader(pdf1_path)
    print(f"  Pages in {pdf1_path}: {len(r1.pages)}")
    writer.append(pdf1_path)
    
    print(f"Reading {pdf2_path}...")
    r2 = PdfReader(pdf2_path)
    print(f"  Pages in {pdf2_path}: {len(r2.pages)}")
    writer.append(pdf2_path)
    
    print(f"Writing merged PDF to {output_path}...")
    with open(output_path, "wb") as f_out:
        writer.write(f_out)
    writer.close()
    
    r_merged = PdfReader(output_path)
    print(f"Successfully generated merged PDF: {output_path}")
    print(f"Total pages: {len(r_merged.pages)} (Expected: {len(r1.pages) + len(r2.pages)})")

if __name__ == "__main__":
    p1 = sys.argv[1] if len(sys.argv) > 1 else "VeriLoom_Round_1_Updated.pdf"
    p2 = sys.argv[2] if len(sys.argv) > 2 else "VeriLoom_Round_2_Project_Plan.pdf"
    out = sys.argv[3] if len(sys.argv) > 3 else "VeriLoom_Combined_Round1_and_Round2.pdf"
    merge_documents(p1, p2, out)
