variable "stage" {
  description = "Deployment environment"
  default = "dev"
}

variable "aws_profile" {}

variable "app_subdomain" {
  description = "App subdomain"
}

variable "root_domain" {
  description = "App root domain"
}

variable "aws_region" {
  default = "us-east-1"
}

data "template_file" "site_fqdn" {
  template = "$${subdomain}$${apex}"

  vars {
    subdomain = "${var.site_subdomain == "" ? "" : "${var.site_subdomain}."}"
    apex = "${var.site_apex}"
  }
}

data "template_file" "site_symbolic_name" {
  template = "$${symbolic}"

  vars {
    symbolic = "${replace(data.template_file.site_fqdn.rendered, ".", "_")}"
  }
}
